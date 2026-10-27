import type { CSSProperties } from 'react';
import { SCENES, boxStyle, poseBox, propBox, type Box } from '@/lib/scenes';
export const aureliaScene=SCENES.aurelia;
export const GLAUCIA_POSES=['idle','relaxed','side'] as const;
export const PRINCE_POSES=['front','paw'] as const;
// Mirror only the relay reaction; poseBox compensates its asymmetric feet anchor.
const relayScene={...aureliaScene,stages:{...aureliaScene.stages,prince:{...aureliaScene.stages.prince,flip:true}}};
const {actors,props}=aureliaScene.assets;
export const SPOTS={garden:{u:.7,v:.82},beacon:{u:.745,v:.87}};
const garden=propBox(aureliaScene,'garden-dome-idle',69,92);
const beacon=propBox(aureliaScene,'communication-beacon-idle',74.5,93);
const idle=poseBox(aureliaScene,'glaucia','idle');
const prince=poseBox(aureliaScene,'prince','front');
export const HOTSPOTS:Record<'glaucia'|'prince'|'garden'|'beacon',Box>={
  glaucia:{left:idle.left+idle.width*.2,top:idle.top,width:idle.width*.6,height:idle.height*.8},
  // Leave the feet to the beacon. CSS grows the 44px head target upwards on tablets.
  prince:{...prince,height:beacon.top-1-prince.top},garden,beacon,
};
const sprite=(src:string):CSSProperties=>({backgroundImage:`url(${src})`});
const actorStyle=(actor:'glaucia'|'prince',name:string)=>{
  const art=(actors[actor] as Record<string,{src:string;feetX:number;w:number}>)[name];
  const flip=actor==='prince'&&name==='paw';
  return {...boxStyle(poseBox(flip?relayScene:aureliaScene,actor,name)),...sprite(art.src),
    transform:flip?'scaleX(-1)':undefined,transformOrigin:flip?'50% 100%':`${art.feetX/art.w*100}% 100%`};
};
export function AureliaScene(){
  return <div className="hero-scene-layer hero-scene-layer--aurelia" data-paused="true" aria-hidden="true">
    <div className="aurelia-plane">
      <canvas className="aurelia-sky aurelia-sky--back"/>
      <span className="aurelia-garden" style={boxStyle(garden)}>
        <i className="aurelia-garden__idle" style={sprite(props['garden-dome-idle'].src)}/>
        <i className="aurelia-garden__bloom" style={sprite(props['garden-dome-blooming'].src)}/>
      </span>
      <span className="aurelia-prince">{PRINCE_POSES.map(pose=><i key={pose} data-actor-pose={pose} style={actorStyle('prince',pose)}/>)}</span>
      <span className="aurelia-beacon" style={boxStyle(beacon)}>
        <i className="aurelia-beacon__idle" style={sprite(props['communication-beacon-idle'].src)}/>
        <i className="aurelia-beacon__active" style={sprite(props['communication-beacon-active'].src)}/>
      </span>
      <span className="aurelia-crew">{GLAUCIA_POSES.map(pose=><i key={pose} data-actor-pose={pose} style={actorStyle('glaucia',pose)}/>)}<i className="aurelia-blink" style={actorStyle('glaucia','blink')}/></span>
      <canvas className="aurelia-sky aurelia-sky--front"/>
    </div>
  </div>;
}
export function AureliaHotspots({labels}:{labels:Record<keyof typeof HOTSPOTS,string>}){
  return <div className="aurelia-layer"><div className="aurelia-plane aurelia-plane--hot">
    {Object.entries(HOTSPOTS).map(([key,box])=>{
      // Anchor minimum-size expansion away from neighbouring targets, on the same plate.
      const anchor=key==='prince'?{left:box.left+box.width/2,top:box.top+box.height}
        :key==='beacon'?{left:box.left+box.width/2}:key==='garden'?{left:box.left+box.width}:{};
      return <button type="button" key={key} data-hot={key} className={`aurelia-hot aurelia-hot--${key}`} aria-label={labels[key as keyof typeof labels]} title={labels[key as keyof typeof labels]} style={boxStyle({...box,...anchor})} hidden/>;
    })}
  </div></div>;
}
