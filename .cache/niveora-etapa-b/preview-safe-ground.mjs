import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
const assets = JSON.parse(fs.readFileSync('src/data/galaxia/niveora.json', 'utf8'));
const layout = JSON.parse(fs.readFileSync('src/data/galaxia/layout.json', 'utf8')).niveora;
const dir = path.join(os.tmpdir(), 'niveora-etapa-b-safe-ground');
fs.mkdirSync(dir, { recursive: true });
const W = assets.background.w, H = assets.background.h;
const svg = (w,h,body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
const text = (x,y,t,size=20) => `<text x="${x}" y="${y}" fill="#e5f6ff" font-family="Segoe UI, sans-serif" font-size="${size}">${t}</text>`;
const rect = (b,color='#55e9e8') => `<rect x="${b.left}" y="${b.top}" width="${b.width}" height="${b.height}" fill="none" stroke="${color}" stroke-width="2"/>`;
function actorBox(actor, pose, x) {
  const stage = layout.stages[actor], sprite = assets.actors[actor][pose];
  const scale = stage.height / 100 * H / assets.actors[actor][stage.reference].h;
  return { left: Math.round((x ?? stage.x)/100*W-sprite.feetX*scale), top: Math.round(stage.y/100*H-sprite.h*scale), width: Math.round(sprite.w*scale), height: Math.round(sprite.h*scale) };
}
function propBox(name,x,y) {
 const s=assets.props[name], scale=layout.props[name]??1;
 return {left:Math.round(x/100*W-s.w*scale/2), top:Math.round(y/100*H-s.h*scale),width:Math.round(s.w*scale),height:Math.round(s.h*scale)};
}
async function layer(sprite,b) {return {input:await sharp(`public${sprite.src}`).resize(b.width,b.height,{kernel:'nearest'}).png().toBuffer(),left:b.left,top:b.top};}
const scenarios = [
 ['01-referencia','Referência atual','idle','stand'],
 ['02-frio-a','Frio A','cold-a','cold'],
 ['03-frio-b','Frio B','cold-b','cold'],
 ['04-vento','Rajada','brace','wind'],
 ['05-caminhada','Caminhada na trilha','idle','walk-1',72],
 ['06-farejar','Farejando','warm-hands','sniff-down-a',68],
 ['07-cavar','Cavando junto à cápsula','idle','dig-a',68],
 ['08-sacudir','Sacudir neve — quadro A','cold-a','shake-a'],
 ['09-abanar','Abanando — quadro A','idle','wag-a'],
];
const thumbs=[];
for(const [id,title,g,d,x] of scenarios) {
 const layers=[];
 const props=[['prismatic-ice-specimen',69,75.5],['aurora-beacon',95.5,90]];
 if(x) props.push(['memory-capsule-sealed',64,80]);
 for(const [name,u,v] of props) layers.push(await layer(assets.props[name],propBox(name,u,v)));
 for(const [actor,pose,u] of [['glaucia',g,undefined],['prince',d,x]]) layers.push(await layer(assets.actors[actor][pose],actorBox(actor,pose,u)));
 const image=await sharp(`public${assets.background.src}`).composite(layers).png().toBuffer();
 await sharp(image).toFile(path.join(dir,`${id}.png`));
 const gl=actorBox('glaucia',g), dog=actorBox('prince',d,x);
 const idle=actorBox('glaucia','idle');
 const hot={left:idle.left+idle.width*.18,top:idle.top,width:idle.width*.64,height:idle.height*.62};
 let marks=rect(gl)+rect(dog)+rect(hot,'#ffb877');
 for(const [name,u,v] of props) marks+=rect(propBox(name,u,v),'#ffb877');
 for(const [actor,u] of [['glaucia',84],['prince',x??layout.stages.prince.x]]) {
  const y=layout.stages[actor].y/100*H, xx=u/100*W;
  marks+=`<path d="M ${xx-130} ${y} H ${xx+130} M ${xx} ${y-16} V ${y+10}" stroke="#55e9e8" stroke-width="2"/>`;
 }
 marks+=text(24,34,title)+text(24,61,`${g} / ${d} · ciano: sprites e âncoras · laranja: hotspots`,16);
 await sharp(image).composite([{input:svg(W,H,marks)}]).toFile(path.join(dir,`${id}-debug.png`));
 const thumb=await sharp(image).resize(836,471).extend({top:38,bottom:0,left:0,right:0,background:'#0d172b'}).png().toBuffer();
 thumbs.push({input:await sharp(thumb).composite([{input:svg(836,509,text(16,26,`${title} · ${g} / ${d}`,18))}]).png().toBuffer(),left:(thumbs.length%3)*836,top:Math.floor(thumbs.length/3)*509});
 if(id==='04-vento') await sharp(image).resize(390,Math.round(390*H/W)).toFile(path.join(dir,'mobile-390.png'));
}
await sharp({create:{width:2508,height:1527,channels:4,background:'#0d172b'}}).composite(thumbs).png().toFile(path.join(dir,'00-composicoes.png'));
async function sheet(actor,names,cols,cw,ch) {
 const rows=Math.ceil(names.length/cols),layers=[];
 let marks='';
 for(const [i,name] of names.entries()) {
  const s=assets.actors[actor][name], b=actorBox(actor,name), col=i%cols,row=Math.floor(i/cols);
  const scale=layout.stages[actor].height/100*H/assets.actors[actor][layout.stages[actor].reference].h;
  const anchor=col*cw+cw*.55, baseline=row*ch+ch-34;
  layers.push(await layer(s,{...b,left:Math.round(anchor-s.feetX*scale),top:baseline-b.height}));
  marks+=text(col*cw+12,row*ch+26,name,17);
  marks+=`<path d="M ${col*cw+8} ${baseline} H ${(col+1)*cw-8} M ${anchor} ${baseline-10} V ${baseline+10}" stroke="#55e9e8" stroke-width="1"/>`;
  marks+=text(col*cw+12,row*ch+ch-9,`${s.px[0]} × ${s.px[1]} px`,13);
 }
 layers.push({input:svg(cols*cw,rows*ch,marks)});
 await sharp({create:{width:cols*cw,height:rows*ch,channels:4,background:'#172b43'}}).composite(layers).png().toFile(path.join(dir,`${actor}-poses.png`));
}
await sheet('glaucia',['idle','cold-a','cold-b','brace','warm-hands'],5,255,560);
await sheet('prince',['stand','sniff',...Object.keys(assets.actors.prince).filter(p=>!['stand','sniff','sensor'].includes(p)&&!p.startsWith('face-'))],4,250,220);
console.log(dir);
