'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP, HERO_OVERLAY } from '@/lib/gsap';
import { useMediaQuery, useMotionEnabled } from '@/lib/use-motion';
import { observeMotionActivity } from '@/lib/motion';
import { whenBootDone } from '@/lib/boot';
import { bringIntoView, discover, emitEgg, onEgg, type EggId } from '@/lib/eggs';
import { play } from '@/lib/sfx';
import type { AureliaCopy } from '@/i18n/aurelia';
import type { Locale } from '@/i18n/config';
import type { GardenRecord } from '@/lib/aurelia-records';
import { createGarden } from './garden-engine';
import { createPetalJump } from './petal-jump';
import { SPOTS } from './AureliaScene';

const OVERLAY=HERO_OVERLAY;
const HERO_EGGS:EggId[]=['garden-bloom','beacon-relay'];
export function AureliaMotion({children,copy,records,lang}:{children:ReactNode;copy:AureliaCopy;records:GardenRecord[];lang:Locale}){
  const hero=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null),readout=useRef<HTMLParagraphElement>(null);
  const [reading,setReading]=useState<number|null>(null);
  const next=useRef(0),focusReading=useRef(false),pending=useRef<EggId|null>(null);
  const motion=useMotionEnabled(),overlay=useMediaQuery(OVERLAY);
  useEffect(()=>{if(reading!==null && focusReading.current)readout.current?.focus({preventScroll:true});},[reading]);

  useGSAP(()=>{
    const section=hero.current;if(!section)return;
    const q=<T extends Element=HTMLElement>(selector:string)=>section.querySelector<T>(selector)!;
    const layer=q('.hero-scene-layer'),crew=q('.aurelia-crew'),prince=q('.aurelia-prince');
    const buttons=Array.from(section.querySelectorAll<HTMLButtonElement>('.aurelia-hot'));
    let disposed=false,active=false,request=0;
    const garden=motion?createGarden({back:q('.aurelia-sky--back'),front:q('.aurelia-sky--front')}):null;
    const setPose=(actor:HTMLElement,name:string)=>{actor.dataset.pose=name;};
    setPose(crew,'idle');setPose(prince,'stand');
    section.dataset.stage='idle';
    const settle=()=>{section.dataset.stage='idle';setPose(crew,'idle');setPose(prince,'stand');};
    const reveal=()=>{
      focusReading.current=!!document.activeElement?.matches('.aurelia-hot:focus-visible, .comlink *');
      setReading(next.current++%records.length);
    };
    // Only scroll and focus the contact heading. Never access, modify or submit the form.
    const contact=()=>{
      const panel=document.getElementById('contato');
      if(panel)panel.dataset.relay='true';
      const status=document.getElementById('aurelia-channel-status');
      if(status)status.textContent=copy.contact.ready;
      void bringIntoView(panel).then(()=>{
        if(disposed)return;
        const heading=panel?.querySelector('h2');
        if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
      });
    };
    // Pre-built paused timelines stay in this useGSAP context and pause with the scene.
    const bloom=gsap.timeline({paused:true,onComplete:settle})
      .call(()=>{section.dataset.stage='bloom';setPose(crew,'side');garden?.bloom(SPOTS.garden);play('garden-bloom');})
      .call(()=>{section.dataset.bloom='true';reveal();pending.current=null;setPose(crew,'relaxed');},[],.65)
      .to({}, {duration:1.4});
    const relay=gsap.timeline({paused:true,onComplete:()=>{pending.current=null;settle();contact();}})
      .call(()=>{section.dataset.stage='relay';section.dataset.beacon='true';setPose(prince,'paw');garden?.bloom(SPOTS.beacon);play('relay');})
      .to({}, {duration:1.1});
    const stopActivity=observeMotionActivity(layer,on=>{
      active=on;layer.dataset.paused=String(!on);
      if(on){garden?.start();if(section.dataset.stage==='bloom')bloom.resume();if(section.dataset.stage==='relay')relay.resume();}
      else {garden?.stop();bloom.pause();relay.pause();}
    });
    const run=(id:EggId)=>{
      if(disposed)return;
      bloom.pause();relay.pause();settle();discover(id);pending.current=id;
      if(!motion){
        pending.current=null;
        if(id==='garden-bloom'){section.dataset.bloom='true';reveal();}
        else {section.dataset.beacon='true';contact();}
        return;
      }
      const timeline=id==='garden-bloom'?bloom:relay;
      section.dataset.stage=id==='garden-bloom'?'bloom':'relay';
      timeline.restart();if(!active)timeline.pause();
    };
    if(pending.current)run(pending.current);
    const stopEggs=onEgg(HERO_EGGS,id=>{
      const current=++request;
      void bringIntoView(section).then(()=>{if(!disposed&&request===current)run(id);});
    });
    const click=(event:Event)=>emitEgg(['glaucia','garden'].includes((event.currentTarget as HTMLElement).dataset.hot!)?'garden-bloom':'beacon-relay');
    buttons.forEach(button=>{button.hidden=false;button.addEventListener('click',click);});
    let stopIntro=()=>{};
    let jump:ReturnType<typeof createPetalJump>|null=null;
    if(motion){
      const intro=gsap.timeline({paused:true}).from('.aurelia-copy > *',{autoAlpha:0,y:22,duration:.75,stagger:.07,ease:'power3.out'});
      stopIntro=whenBootDone(()=>intro.play());
      if(overlay){
        jump=createPetalJump(canvas.current!);const state={progress:0};
        gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:section,start:'top top',end:'+=120%',pin:true,scrub:.8,anticipatePin:1,refreshPriority:1}})
          .to([q('.page-hero__image'),layer,q('.aurelia-layer')],{scale:1.25,transformOrigin:'80% 80%',duration:.65},0)
          .to('.aurelia-copy',{autoAlpha:0,xPercent:-10,duration:.3},0)
          .to(['.hero-hud','.aurelia-readout'],{autoAlpha:0,duration:.2},0)
          .to(canvas.current,{autoAlpha:1,duration:.1},.3)
          .to(state,{progress:1,duration:.7,onUpdate:()=>jump?.set(state.progress)},.3)
          .to('.hero-jump__label',{autoAlpha:1,duration:.15},.65)
          .to('.hero-jump__label',{autoAlpha:0,duration:.15},.85);
      }
      ScrollTrigger.sort();ScrollTrigger.refresh();
    }
    return ()=>{
      disposed=true;request++;stopEggs();stopIntro();stopActivity();garden?.destroy();jump?.destroy();
      buttons.forEach(button=>{button.hidden=true;button.removeEventListener('click',click);});
      layer.dataset.paused='true';settle();delete crew.dataset.pose;delete prince.dataset.pose;
      // Keep completed discoveries visually static when motion preferences change.
    };
  },{scope:hero,dependencies:[motion,overlay,copy,records],revertOnUpdate:true});
  const close=()=>{setReading(null);hero.current?.querySelector<HTMLButtonElement>('.aurelia-hot--glaucia')?.focus({preventScroll:true});};
  const record=reading===null?null:records[reading];
  return <section ref={hero} className="page-hero home-hero-v2 aurelia-hero" aria-labelledby="services-title" data-motion={motion}>
    {children}
    <p className="sky-touch-hint" aria-hidden="true"><span/>{copy.hud.touch}</p>
    <div className="aurelia-readout" hidden={!record} role="region" aria-label={copy.readout.bloom}>
      {record&&<><p className="aurelia-kicker">{copy.readout.bloom}</p><p ref={readout} tabIndex={-1} className="aurelia-readout__title">{record.service.titulo[lang]}</p><p>{record.service.descricao[lang]}</p>
        <div className="aurelia-readout__actions"><a href={`/${lang}/servicos?assunto=${record.subject}#contato`}>{copy.readout.contact}</a><button type="button" onClick={()=>emitEgg('garden-bloom')}>{copy.readout.next}</button><button type="button" onClick={close}>{copy.readout.close}</button></div></>}
    </div>
    <div className="hero-jump hero-jump--aurelia" aria-hidden="true"><canvas ref={canvas} className="hero-jump__canvas"/><p className="hero-jump__label">{copy.hero.jump}</p></div>
  </section>;
}
