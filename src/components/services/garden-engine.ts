// Aurélia's air flows from the hanging plants toward the terrace. Logical pixels, no DPR multiplier.
export const PIXEL = 2;
export const MAX_PARTICLES = 160;
export type UV = { u: number; v: number };
type Particle = UV & { age: number; life: number; dx: number; dy: number; petal: boolean };
export function createGarden({ back, front }: { back: HTMLCanvasElement; front: HTMLCanvasElement }) {
  const bg = back.getContext('2d'), fg = front.getContext('2d');
  let width = 1, height = 1, time = 0, previous = 0, raf = 0, running = false, destroyed = false;
  const particles: Particle[] = [];
  let seed = 61;
  const random = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const air = Array.from({ length: 56 }, (_, i) => ({ u: .5 + random() * .5, v: random(), phase: random() * 6.28, speed: .006 + random() * .014, petal: i % 4 === 0 }));
  const resize = () => {
    width = Math.max(1, Math.round(back.clientWidth / PIXEL)); height = Math.max(1, Math.round(back.clientHeight / PIXEL));
    for (const canvas of [back, front]) { canvas.width = width; canvas.height = height; }
    for (const ctx of [bg, fg]) if (ctx) ctx.imageSmoothingEnabled = false;
  };
  const pixel = (ctx: CanvasRenderingContext2D, u: number, v: number, petal: boolean, alpha: number, phase: number) => {
    const x = Math.round(u * width), y = Math.round(v * height);
    ctx.globalAlpha = alpha; ctx.fillStyle = petal ? '#ffa69e' : '#87e4c1';
    ctx.fillRect(x, y, petal ? 3 : 1, petal ? 2 : 1);
    if (petal) { ctx.fillStyle = '#f9d3ba'; ctx.fillRect(x + (Math.sin(phase) > 0 ? 2 : -1), y - 1, 2, 1); }
  };
  const draw = (dt: number) => {
    time += dt;
    bg?.clearRect(0,0,width,height); fg?.clearRect(0,0,width,height);
    if (bg) {
      for (const p of air) {
        const v = (p.v + time * p.speed) % 1;
        pixel(bg, p.u + Math.sin(time * .4 + p.phase) * .018 - v * .08, v, p.petal, .25 + Math.sin(time + p.phase) ** 2 * .35, time + p.phase);
      }
      // Broken horizontal glints follow the water; pale rising pixels suggest irrigation vapour.
      for (let i=0;i<12;i++) {
        const x = Math.round((.67 + i * .025) * width), y = Math.round((.79 + Math.sin(i * 7) * .025) * height);
        bg.globalAlpha = .08 + Math.sin(time * .6 + i) ** 2 * .22; bg.fillStyle = '#d5fff0'; bg.fillRect(x,y,3 + i % 5,1);
        const rise = (time * .06 + i * .083) % 1;
        bg.globalAlpha = (1-rise) * .15; bg.fillRect(x + Math.round(Math.sin(time+i)*3),Math.round((.78-rise*.14)*height),2,2);
      }
      bg.globalAlpha=1;
    }
    for(let i=particles.length-1;i>=0;i--) {
      const p=particles[i]; p.age+=dt;
      if(p.age>=p.life) {particles.splice(i,1);continue;}
      p.u+=p.dx*dt; p.v+=p.dy*dt; p.dy+=.008*dt;
      if(fg) pixel(fg,p.u+Math.sin(time*2+i)*.003,p.v,p.petal,(1-p.age/p.life)*.85,time*3+i);
    }
    if(fg) fg.globalAlpha=1;
  };
  const frame = (now: number) => {
    if(!running || destroyed) return;
    draw(previous ? Math.min(.05,(now-previous)/1000) : 0); previous=now;
    raf=requestAnimationFrame(frame);
  };
  resize(); const observer=new ResizeObserver(resize); observer.observe(back);
  const stop = () => { running=false; cancelAnimationFrame(raf); raf=0; previous=0; particles.length=0; bg?.clearRect(0,0,width,height); fg?.clearRect(0,0,width,height); };
  return {
    bloom(at: UV) {
      if(destroyed) return;
      const count=Math.min(28,MAX_PARTICLES-particles.length);
      for(let i=0;i<count;i++) particles.push({ ...at, age:0,life:1.8+random()*1.2,dx:(random()-.5)*.08,dy:-.015-random()*.06,petal:i%3===0 });
    },
    start() { if(running || destroyed) return; running=true; previous=0; raf=requestAnimationFrame(frame); },
    stop,
    load: () => particles.length,
    destroy() { destroyed=true; stop(); observer.disconnect(); },
  };
}
