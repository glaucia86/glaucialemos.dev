'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { advancePollination, serviceHref } from '@/lib/aurelia-controls';
import type { GardenRecord } from '@/lib/aurelia-records';
import { bringIntoView, discover, emitEgg, onEgg } from '@/lib/eggs';
import { play } from '@/lib/sfx';
import type { Locale } from '@/i18n/config';
import type { AureliaCopy } from '@/i18n/aurelia';
export function ServiceGarden({records,copy,lang,price}:{records:GardenRecord[];copy:AureliaCopy['garden'];lang:Locale;price:string}){
  const root=useRef<HTMLDivElement>(null),vault=useRef<HTMLDetailsElement>(null);
  const [ready,setReady]=useState(false),[connected,setConnected]=useState(0),[seed,setSeed]=useState(0);
  const seedIndex=useRef(0);
  useEffect(()=>{setReady(true);let disposed=false;
    const stop=onEgg(['seed-vault','pollination'],id=>void bringIntoView(id==='seed-vault'?vault.current:root.current).then(()=>{
      if(disposed)return;
      if(id==='seed-vault'){
        setSeed(seedIndex.current++%records.length);
        if(vault.current)vault.current.open=true;
      }else setConnected(records.length);
      discover(id);play(id==='seed-vault'?'seed':'garden-bloom');
    }));
    return()=>{disposed=true;stop();};
  },[records.length]);
  const connect=(index:number)=>{
    const next=advancePollination(connected,index,records.length);setConnected(next);play('hover-aurelia');
    if(next===records.length&&connected!==next)emitEgg('pollination');
  };
  const selected=records[seed];
  return <div ref={root} className="service-garden" data-complete={connected===records.length||undefined}>
    <p className="service-garden__instruction" hidden={!ready}>{copy.order}</p>
    <div className="service-cards aurelia-cards">
      {records.map(({service,subject},index)=><article key={service.id} id={`service-${service.id}`} data-lit={index<connected||undefined}>
        <div className="service-garden__stem" aria-hidden="true"><i/><i/><i/></div>
        <span className="aurelia-kicker">{String(index+1).padStart(2,'0')}</span><h3>{service.titulo[lang]}</h3><p>{service.descricao[lang]}</p><strong>{service.preco==='sob consulta'?price:service.preco}</strong>
        <Link href={serviceHref(lang,subject)} className="hero-link">{copy.contact} <span aria-hidden="true">↗</span></Link>
        <button hidden={!ready} type="button" className="service-garden__connect" aria-label={copy.connect.replace('{n}',String(index+1))} aria-pressed={index<connected} onClick={()=>connect(index)}><span aria-hidden="true">✧ {String(index+1).padStart(2,'0')}</span></button>
      </article>)}
    </div>
    <p className="service-garden__status" role="status" hidden={!ready}>{connected===records.length?copy.completed:copy.progress.replace('{n}',String(connected)).replace('{total}',String(records.length))}</p>
    {connected>0&&<button type="button" className="aurelia-reset" onClick={()=>setConnected(0)}>{copy.reset}</button>}
    <details ref={vault} className="seed-vault" onToggle={event=>{if(event.currentTarget.open){discover('seed-vault');play('seed');}}}>
      <summary><span aria-hidden="true">◇</span> {copy.seed}</summary><div className="seed-vault__body"><p>{copy.seedNote}</p><h3>{selected.service.titulo[lang]}</h3><p>{selected.service.descricao[lang]}</p><strong>{selected.service.preco==='sob consulta'?price:selected.service.preco}</strong><Link className="hero-link" href={serviceHref(lang,selected.subject)}>{copy.contact} ↗</Link>
      <button hidden={!ready} type="button" onClick={()=>emitEgg('seed-vault')}>{copy.open}</button></div>
    </details>
  </div>;
}
