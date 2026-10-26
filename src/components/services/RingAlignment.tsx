'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { bringIntoView, discover, emitEgg, onEgg } from '@/lib/eggs';
import { RING_START, ringsAligned, turnRing } from '@/lib/aurelia-controls';
import { play } from '@/lib/sfx';
import type { AureliaCopy } from '@/i18n/aurelia';
import type { Locale } from '@/i18n/config';
export function RingAlignment({copy,lang}:{copy:AureliaCopy['rings'];lang:Locale}){
  const [rings,setRings]=useState<number[]>([...RING_START]);
  const [ready,setReady]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const aligned=ringsAligned(rings);
  useEffect(()=>{setReady(true);let disposed=false;
    const stop=onEgg('ring-alignment',()=>void bringIntoView(root.current).then(()=>{if(!disposed){setRings([0,0,0]);discover('ring-alignment');play('align-aurelia');}}));
    return()=>{disposed=true;stop();};
  },[]);
  const turn=(index:number)=>{const next=rings.map((value,i)=>i===index?turnRing(value):value);setRings(next);play('hover-aurelia');if(ringsAligned(next))emitEgg('ring-alignment');};
  return <div ref={root} className="orbital-garden" data-aligned={aligned||undefined}>
    <div className="orbital-garden__planet" aria-hidden="true"><i/>{rings.map((angle,index)=><span key={index} style={{'--angle':`${angle*90}deg`,'--orbit':index} as CSSProperties}><b/></span>)}</div>
    <div className="orbital-garden__panel">
      <p>{copy.intro}</p>
      <div className="orbital-garden__controls" hidden={!ready}>{rings.map((angle,index)=><button type="button" key={index} onClick={()=>turn(index)} aria-label={`${copy.label.replace('{n}',String(index+1))}. ${copy.position.replace('{n}',String(angle+1))}`} aria-pressed={angle===0}><span aria-hidden="true">{String(index+1).padStart(2,'0')} ↻</span></button>)}</div>
      <p role="status">{aligned?copy.aligned:''}</p>
      <Link className="hero-link" href={`/${lang}/sobre#trajetoria`}>{copy.link} <span aria-hidden="true">↗</span></Link>
      {aligned&&<button type="button" className="aurelia-reset" onClick={()=>setRings([...RING_START])}>{copy.reset}</button>}
    </div>
  </div>;
}
