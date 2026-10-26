'use client';
import { useEffect, useState } from 'react';
import { emitEgg } from '@/lib/eggs';
export function CollaborationBeacon({label}:{label:string}){
  const [ready,setReady]=useState(false);useEffect(()=>setReady(true),[]);
  return <button hidden={!ready} className="aurelia-relay" type="button" onClick={()=>emitEgg('beacon-relay')}><span aria-hidden="true">◈</span> {label}</button>;
}
