// Scroll-only flight through a spiral of petals. No animation clock remains alive when scrolling stops.
export function createPetalJump(canvas: HTMLCanvasElement) {
  const ctx=canvas.getContext('2d');
  let width=1,height=1,progress=0,destroyed=false;
  const petals=Array.from({length:84},(_,i)=>({angle:i*2.39996,depth:(i*37%83)/83,size:2+i%4}));
  const render=()=>{
    if(!ctx || destroyed) return;
    ctx.clearRect(0,0,width,height);
    if(progress===0) return;
    ctx.globalAlpha=Math.sin(progress*Math.PI)*.65;ctx.fillStyle='#082a30';ctx.fillRect(0,0,width,height);
    const radius=Math.hypot(width,height)*.65;
    for(const p of petals){
      const flight=(p.depth+progress*.85)%1;
      const angle=p.angle+progress*1.7;
      const r=radius*flight*flight;
      const x=Math.round(width*.72+Math.cos(angle)*r),y=Math.round(height*.62+Math.sin(angle)*r*.68);
      const size=Math.max(1,Math.round(p.size*(.4+flight*2)));
      ctx.globalAlpha=Math.sin(progress*Math.PI)*Math.min(1,flight*2);
      ctx.fillStyle=p.size%2 ? '#ffa69e':'#87e4c1';
      ctx.fillRect(x,y,size,Math.max(1,Math.round(size*.45)));
      ctx.fillStyle='#f9d3ba';ctx.fillRect(x+size-1,y-1,Math.max(1,Math.round(size*.4)),1);
      // Spores travel in the wake, progressively farther apart as the camera accelerates.
      for(let tail=1;tail<4;tail++) ctx.fillRect(Math.round(x-Math.cos(angle)*tail*(2+flight*8)),Math.round(y-Math.sin(angle)*tail*3),1,1);
    }
    ctx.globalAlpha=1;
  };
  const resize=()=>{width=Math.max(1,Math.round(canvas.clientWidth/2));height=Math.max(1,Math.round(canvas.clientHeight/2));canvas.width=width;canvas.height=height;if(ctx)ctx.imageSmoothingEnabled=false;render();};
  resize();const observer=new ResizeObserver(resize);observer.observe(canvas);
  return {set(value:number){const next=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;if(next!==progress){progress=next;render();}},destroy(){destroyed=true;observer.disconnect();ctx?.clearRect(0,0,width,height);}};
}
