'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { serviceHref } from '@/lib/aurelia-controls';
import type { GardenRecord } from '@/lib/aurelia-records';
import { bringIntoView, discover, emitEgg, onEgg } from '@/lib/eggs';
import { play } from '@/lib/sfx';
import type { Locale } from '@/i18n/config';
import type { AureliaCopy } from '@/i18n/aurelia';
import { PrinceSwarm } from './PrinceSwarm';

export function ServiceGarden({records,copy,lang,price,princeFace}:{records:GardenRecord[];copy:AureliaCopy['garden'];lang:Locale;price:string;princeFace:string}){
  const root=useRef<HTMLDivElement>(null),vault=useRef<HTMLDetailsElement>(null);
  const [ready,setReady]=useState(false),[lit,setLit]=useState<boolean[]>(()=>records.map(()=>false)),[seed,setSeed]=useState(0);
  const seedIndex=useRef(0);
  const count=lit.filter(Boolean).length,complete=count===records.length;
  useEffect(()=>{setReady(true);let disposed=false;
    const stop=onEgg(['seed-vault','pollination'],id=>void bringIntoView(id==='seed-vault'?vault.current:root.current).then(()=>{
      if(disposed)return;
      if(id==='seed-vault'){
        setSeed(seedIndex.current++%records.length);
        if(vault.current)vault.current.open=true;
      }else setLit(records.map(()=>true));
      discover(id);play(id==='seed-vault'?'seed':'garden-bloom');
    }));
    return()=>{disposed=true;stop();};
  },[records]);
  // The swarm pollinates one bed at a time; the last one completes the secret.
  const light=(index:number)=>setLit(previous=>{
    if(previous[index])return previous;
    const next=previous.map((value,i)=>value||i===index);
    if(next.every(Boolean))queueMicrotask(()=>emitEgg('pollination'));
    return next;
  });
  const selected=records[seed];
  return <div ref={root} className="service-garden" data-complete={complete||undefined}>
    {ready&&<PrinceSwarm area={root} lit={lit} onLight={light} complete={complete} label={copy.swarm} hint={copy.swarmHint} face={princeFace}/>}
    <div className="service-cards aurelia-cards">
      {records.map(({service,subject},index)=><article key={service.id} id={`service-${service.id}`} data-lit={lit[index]||undefined}>
        <div className="service-garden__stem" aria-hidden="true"><i/><i/><i/></div>
        <span className="aurelia-kicker">{String(index+1).padStart(2,'0')}</span><h3>{service.titulo[lang]}</h3><p>{service.descricao[lang]}</p><strong>{service.preco==='sob consulta'?price:service.preco}</strong>
        <Link href={serviceHref(lang,subject)} className="hero-link">{copy.contact} <span aria-hidden="true">↗</span></Link>
      </article>)}
    </div>
    <p className="service-garden__status" role="status" hidden={!ready}>{complete?copy.completed:copy.progress.replace('{n}',String(count)).replace('{total}',String(records.length))}</p>
    {count>0&&<button type="button" className="aurelia-reset" onClick={()=>setLit(records.map(()=>false))}>{copy.reset}</button>}
    <details ref={vault} className="seed-vault" onToggle={event=>{if(event.currentTarget.open){discover('seed-vault');play('seed');}}}>
      <summary><span aria-hidden="true">◇</span> {copy.seed}</summary><div className="seed-vault__body"><p>{copy.seedNote}</p><h3>{selected.service.titulo[lang]}</h3><p>{selected.service.descricao[lang]}</p><strong>{selected.service.preco==='sob consulta'?price:selected.service.preco}</strong><Link className="hero-link" href={serviceHref(lang,selected.subject)}>{copy.contact} ↗</Link>
      <button hidden={!ready} type="button" onClick={()=>emitEgg('seed-vault')}>{copy.open}</button></div>
    </details>
  </div>;
}
