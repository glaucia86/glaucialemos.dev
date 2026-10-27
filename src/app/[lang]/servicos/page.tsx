import '../../home.css';
import '../../aurelia.css';
import '../../beyond-orbit.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/ContactForm';
import { ContactCinema } from '@/components/services/ContactCinema';
import { contactConfig } from '@/lib/contact-config';
import { EpilogueSignal } from '@/components/epilogue/EpilogueSignal';
import { ReadingProgress } from '@/components/ReadingProgress';
import { BootSequence } from '@/components/home/BootSequence';
import { HudClock } from '@/components/home/HudClock';
import { HomeChoreography } from '@/components/home/HomeChoreography';
import { ChapterTag, ChapterJump } from '@/components/home/Chapter';
import { DiscoveryCount } from '@/components/about/DiscoveryCount';
import { AureliaScene, AureliaHotspots, aureliaScene } from '@/components/services/AureliaScene';
import { AureliaMotion } from '@/components/services/AureliaMotion';
import { AureliaEggs } from '@/components/services/AureliaEggs';
import { RingAlignment } from '@/components/services/RingAlignment';
import { ServiceGarden } from '@/components/services/ServiceGarden';
import { GreenhouseDusk } from '@/components/services/GreenhouseDusk';
import { CollaborationBeacon } from '@/components/services/CollaborationBeacon';
import { gardenRecords } from '@/lib/aurelia-records';
import { getServicos } from '@/lib/data';
import { AURELIA_BOOT_KEY, bootScriptFor } from '@/lib/boot';
import { beyondOrbit } from '@/i18n/beyond-orbit';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

type Props={params:Promise<{lang:string}>;searchParams:Promise<{assunto?:string|string[]}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {lang}=await params;return isLocale(lang)?getDictionary(lang).services.metadata:{};}
const code=(index:number)=>`◆ ${String(index+1).padStart(2,'0')}`;
export default async function Services({params,searchParams}:Props){
  const {lang}=await params;if(!isLocale(lang))notFound();
  const d=getDictionary(lang),a=d.aurelia,records=gardenRecords(getServicos());
  const contact=contactConfig();
  const {assunto}=await searchParams;
  const subject=typeof assunto==='string'?assunto:null;
  const ticker=records.map(({service})=>service.titulo[lang]);
  return <main id="main" className="home-page services-page" data-sound-world="aurelia" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{__html:bootScriptFor(AURELIA_BOOT_KEY)}}/>
    <BootSequence {...a.boot} storageKey={AURELIA_BOOT_KEY} variant="aurelia" armOnNavigation/>
    <ReadingProgress variant="aurelia"/>
    <div className="aurelia-hero-wrap">
      <AureliaMotion copy={a} records={records} lang={lang}>
        <Image className="page-hero__image" src={aureliaScene.assets.background.src} alt={a.hero.alt} fill priority fetchPriority="high" sizes="100vw"/>
        <AureliaScene/>
        <div className="page-hero__shade" aria-hidden="true"/>
        <div className="hero-hud aurelia-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl"/><span className="hud-corner hud-corner--tr"/><span className="hud-corner hud-corner--bl"/><span className="hud-corner hud-corner--br"/>
          <p className="hud-top"><span className="hud-rec"/>{a.hud.channel}<span className="hud-sep">/</span><HudClock/></p>
          <p className="hud-location">{a.hud.location}</p><p className="hud-hint">{a.hud.hint}</p>
        </div>
        <div className="page-hero__content aurelia-copy">
          <ChapterTag code={code(0)} label={a.chapters[0]}/>
          <p className="aurelia-world">{a.hero.world}</p>
          <h1 id="services-title">{d.services.title}</h1>
          <p className="page-hero__subtitle">{a.hero.intro}</p><p className="page-hero__extra">{a.hero.extra}</p>
          <div className="actions"><a className="button primary" data-magnetic href="#contato">{d.home.primaryCta}</a><Link className="hero-link" href={`/${lang}/eventos`}>{d.events.secondaryCta} <span aria-hidden="true">↗</span></Link></div>
        </div>
        <AureliaHotspots labels={a.hud}/>
      </AureliaMotion>
      <DiscoveryCount page="services" label={a.discoveries} className="aurelia-discoveries"/>
      <div className="hero-bar" aria-hidden="true"><span className="hero-bar__caption"><span className="pixel-mark"/>{a.hero.caption}</span><span className="hero-bar__ticker"><span className="hero-bar__track">{[...ticker,...ticker].map((item,i)=><span key={i}>{item}<b>◆</b></span>)}</span></span><span className="hero-bar__scroll">{a.hero.scroll}<i/></span></div>
    </div>
    <section className="chapter chapter--orbits" id="orbitas" aria-labelledby="orbits-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={code(1)} label={a.chapters[1]}/><h2 id="orbits-title" data-reveal="lines">{a.rings.title}</h2></div></div>
      <RingAlignment copy={a.rings} lang={lang}/>
    </div></section>
    <ChapterJump code={code(2)} label={a.chapters[2]}/>
    <section className="chapter chapter--garden" id="jardins" aria-labelledby="garden-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={code(2)} label={a.chapters[2]}/><h2 id="garden-title" data-reveal="lines">{a.garden.title}</h2><p data-reveal="up">{a.garden.intro}</p></div></div>
      <ServiceGarden records={records} copy={a.garden} lang={lang} price={d.services.price}/>
    </div></section>
    <ChapterJump code={code(3)} label={a.chapters[3]}/>
    <section className="chapter chapter--collaboration" aria-labelledby="collaboration-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={code(3)} label={a.chapters[3]}/><h2 id="collaboration-title" data-reveal="lines">{a.contact.title}</h2><p data-reveal="up">{a.contact.intro}</p></div></div>
      <GreenhouseDusk copy={a.dusk}/>
      <CollaborationBeacon label={a.contact.relay}/>
      <p id="aurelia-channel-status" className="aurelia-channel-status" role="status"/>
      <ContactCinema key={subject} copy={a.contact.cinema}>
        <ContactForm copy={d.services} lang={lang} subject={subject} enabled={contact.enabled} siteKey={contact.enabled ? contact.siteKey : undefined}/>
      </ContactCinema>
      <EpilogueSignal lang={lang} copy={beyondOrbit[lang]}/>
    </div></section>
    <AureliaEggs/><HomeChoreography/>
  </main>;
}
