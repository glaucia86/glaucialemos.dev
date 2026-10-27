'use client';
import { useEffect, useRef, useState } from 'react';
import { bringIntoView, discover, emitEgg, onEgg } from '@/lib/eggs';
import { play } from '@/lib/sfx';
import type { AureliaCopy } from '@/i18n/aurelia';
export function GreenhouseDusk({copy}:{copy:AureliaCopy['dusk']}){
  const [light,setLight]=useState(100),[ready,setReady]=useState(false);
  const root=useRef<HTMLDivElement>(null),range=useRef<HTMLInputElement>(null);
  const dusk=light<=20;
  useEffect(()=>{setReady(true);
    return onEgg('greenhouse-dusk',()=>{setLight(15);discover('greenhouse-dusk');play('greenhouse');void bringIntoView(root.current);});
  },[]);
  useEffect(()=>{
    const main=root.current?.closest('main');if(!main)return;
    if(dusk)main.dataset.greenhouse='dusk';else delete main.dataset.greenhouse;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]'))setLight(100);};
    addEventListener('keydown',escape);
    return()=>{delete main.dataset.greenhouse;removeEventListener('keydown',escape);};
  },[dusk]);
  return <div ref={root} className="greenhouse" data-dusk={dusk||undefined}>
    <div className="greenhouse__glass" aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <div className="greenhouse__copy"><h3>{copy.title}</h3><p>{copy.body}</p>
      <label hidden={!ready}>{copy.label}<span className="greenhouse__scale"><span>{copy.night}</span><span>{copy.day}</span></span>
        <input ref={range} type="range" min={0} max={100} step={5} value={light} aria-valuetext={dusk?copy.night:`${light}%`} onChange={event=>{const value=Number(event.target.value);setLight(value);if(value<=20&&!dusk)emitEgg('greenhouse-dusk');}}/>
      </label>
      {dusk&&<button type="button" onClick={()=>{setLight(100);range.current?.focus();}}>{copy.restore}</button>}
    </div>
  </div>;
}
