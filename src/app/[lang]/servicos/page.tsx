import '../../home.css';
import '../../aurelia.css';
import '../../aurelia-story.css';
import '../../beyond-orbit.css';
import '../../credibility.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { WaitlistForm } from '@/components/WaitlistForm';
import { Testimonials as ApprovedTestimonials } from '@/components/services/Testimonials';
import { waitlistCopy } from '@/i18n/waitlist';
import { ContactForm } from '@/components/ContactForm';
import { ContactCinema } from '@/components/services/ContactCinema';
import { contactConfig } from '@/lib/contact-config';
import { ReadingProgress } from '@/components/ReadingProgress';
import { BootSequence } from '@/components/home/BootSequence';
import { HudClock } from '@/components/home/HudClock';
import { HomeChoreography } from '@/components/home/HomeChoreography';
import { ChapterTag, ChapterJump } from '@/components/home/Chapter';
import { DiscoveryCount } from '@/components/about/DiscoveryCount';
import { AureliaScene, AureliaHotspots, ContactCrew, FinaleTerrace, aureliaScene } from '@/components/services/AureliaScene';
import { AureliaMotion } from '@/components/services/AureliaMotion';
import { AureliaEggs } from '@/components/services/AureliaEggs';
import { ProposalHarvest } from '@/components/eggs/ExtraEggs';
import { ServiceGarden } from '@/components/services/ServiceGarden';
import { PlanetEclipse } from '@/components/services/PlanetEclipse';
import { CollaborationBeacon } from '@/components/services/CollaborationBeacon';
import { gardenRecords, proofStars } from '@/lib/aurelia-records';
import { OrbitGyroscope } from '@/components/services/OrbitGyroscope';
import { ProofConstellation } from '@/components/services/ProofConstellation';
import { GardenBloom } from '@/components/services/GardenBloom';
import { WorkSteps } from '@/components/services/WorkSteps';
import { BeaconFinale } from '@/components/services/BeaconFinale';
import { EpilogueTransmission } from '@/components/services/EpilogueTransmission';
import { aureliaStory } from '@/i18n/aurelia-story';
import { getServicos, getDepoimentos } from '@/lib/data';
import { AURELIA_BOOT_KEY, bootScriptFor } from '@/lib/boot';
import { beyondOrbit } from '@/i18n/beyond-orbit';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { Portrait } from '@/components/credibility/Portrait';
import { ProfessionalExperience } from '@/components/credibility/ProfessionalExperience';
import { OfferFormats } from '@/components/credibility/OfferFormats';
import { ActivityGallery } from '@/components/credibility/ActivityGallery';
import { Testimonials as TestimonialSubmission } from '@/components/credibility/Testimonials';
import { commercial } from '@/i18n/commercial';

type Props={params:Promise<{lang:string}>;searchParams:Promise<{assunto?:string|string[];interesse?:string|string[]}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {lang}=await params;return isLocale(lang)?getDictionary(lang).services.metadata:{};}
const code=(index:number)=>`◆ ${String(index+1).padStart(2,'0')}`;
export default async function Services({params,searchParams}:Props){
  const {lang}=await params;if(!isLocale(lang))notFound();
  const d=getDictionary(lang),a=d.aurelia,s=aureliaStory[lang],records=gardenRecords(getServicos());
  const testimonials=getDepoimentos(),w=waitlistCopy[lang];
  const chapterIndex=(index:number)=>index+(testimonials.length>0&&index>=3?1:0);
  const chapterCode=(index:number)=>code(chapterIndex(index));
  // Seven chapters: hero, orbits, proof, garden, how we work, collaboration and the last signal.
  const labels=[a.chapters[0],a.chapters[1],s.chapters.proof,a.chapters[2],s.chapters.steps,a.chapters[3],s.chapters.finale];
  if(testimonials.length>0)labels.splice(3,0,d.services.testimonials);
  const label=(index:number)=>labels[chapterIndex(index)];
  const contact=contactConfig();
  const {assunto,interesse}=await searchParams;
  const interest=typeof interesse==='string'?interesse:null;
  const subject=typeof assunto==='string'?assunto:null;
  const ticker=records.map(({service})=>service.titulo[lang]);
  return <main id="main" className="home-page services-page commercial-page" data-sound-world="aurelia" tabIndex={-1}>
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
          <ChapterTag code={chapterCode(0)} label={a.chapters[0]}/>
          <p className="aurelia-world">{a.hero.world}</p>
          <div className="commercial-intro"><Portrait lang={lang}/><h1 id="services-title">{d.services.title}</h1></div>
          <p className="page-hero__subtitle">{a.hero.intro}</p><p className="page-hero__extra">{a.hero.extra}</p>
          <p className="aurelia-independent"><span aria-hidden="true">◇</span> {d.services.independent}</p>
          <div className="actions"><a className="button primary" data-magnetic href="#contato">{d.home.primaryCta}</a><a className="hero-link" href="#formatos">{commercial[lang].formatsLink} <span aria-hidden="true">↓</span></a></div>
          <ProfessionalExperience lang={lang}/>

        </div>
        <AureliaHotspots labels={a.hud}/>
      </AureliaMotion>
      <DiscoveryCount page="services" label={a.discoveries} className="aurelia-discoveries"/>
      <div className="hero-bar" aria-hidden="true"><span className="hero-bar__caption"><span className="pixel-mark"/>{a.hero.caption}</span><span className="hero-bar__ticker"><span className="hero-bar__track">{[...ticker,...ticker].map((item,i)=><span key={i}>{item}<b>◆</b></span>)}</span></span><span className="hero-bar__scroll">{a.hero.scroll}<i/></span></div>
    </div>
    <OfferFormats lang={lang}/>
    <section className="chapter chapter--orbits" id="orbitas" aria-labelledby="orbits-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={chapterCode(1)} label={label(1)}/><h2 id="orbits-title" data-reveal="lines">{a.rings.title}</h2></div></div>
      <OrbitGyroscope copy={a.rings} story={s.orbit} lang={lang}/>
    </div></section>
    <ChapterJump code={chapterCode(2)} label={label(2)}/>
    <section className="chapter chapter--proof" id="provas" aria-labelledby="proof-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={chapterCode(2)} label={label(2)}/><h2 id="proof-title" data-reveal="lines">{s.proof.title}</h2><p data-reveal="up">{s.proof.intro}</p></div></div>
      <ProofConstellation stars={proofStars(lang)} copy={s.proof} locale={lang}/>
    </div></section>
    <ApprovedTestimonials items={testimonials} lang={lang} label={d.services.testimonials} code={code(3)}/>
    <ChapterJump code={chapterCode(3)} label={label(3)}/>
    <section className="chapter chapter--garden" id="jardins" aria-labelledby="garden-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={chapterCode(3)} label={label(3)}/><h2 id="garden-title" data-reveal="lines">{a.garden.title}</h2><p data-reveal="up">{a.garden.intro}</p></div></div>
      <GardenBloom records={records} copy={s.bloom} lang={lang} waitlist={d.services.waitlist}/>
      <h3 className="garden-compare">{s.bloom.compare}</h3>
      <ServiceGarden records={records} copy={a.garden} lang={lang} waitlist={d.services.waitlist} princeFace={aureliaScene.assets.actors.prince['face-happy'].src}/>
    </div></section>
    <ChapterJump code={chapterCode(4)} label={label(4)}/>
    <ActivityGallery lang={lang}/>
    <TestimonialSubmission lang={lang} enabled={contact.enabled} siteKey={contact.enabled ? contact.siteKey ?? '' : ''}/>
    <section className="chapter chapter--steps" id="como" aria-labelledby="steps-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={chapterCode(4)} label={label(4)}/><h2 id="steps-title" data-reveal="lines">{s.steps.title}</h2><p data-reveal="up">{s.steps.intro}</p></div></div>
      <WorkSteps copy={s.steps}/>
    </div></section>
    <section className="chapter chapter--waitlist" id="lista-de-espera" aria-labelledby="waitlist-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code="◇" label={w.title}/><h2 id="waitlist-title">{w.title}</h2><p>{w.intro}</p></div></div>
      <p className="aurelia-independent"><span aria-hidden="true">◇</span> {d.services.independent}</p>
      <WaitlistForm lang={lang} interest={interest} enabled={contact.enabled && Boolean(contact.waitlistSecret)} siteKey={contact.enabled && contact.waitlistSecret ? contact.siteKey : undefined}/>
    </div></section>
    <ChapterJump code={chapterCode(5)} label={label(5)}/>
    <section className="chapter chapter--collaboration" aria-labelledby="collaboration-title"><div className="chapter__inner">
      <div className="chapter-head"><div><ChapterTag code={chapterCode(5)} label={label(5)}/><h2 id="collaboration-title" data-reveal="lines">{a.contact.title}</h2><p data-reveal="up">{a.contact.intro}</p></div></div>
      <PlanetEclipse copy={a.dusk}/>
      <CollaborationBeacon label={a.contact.relay}/>
      <p id="aurelia-channel-status" className="aurelia-channel-status" role="status"/>
      <ContactCinema key={subject} copy={a.contact.cinema} portal={a.contact.portal} crew={<ContactCrew/>}>
        <ContactForm copy={d.services} lang={lang} subject={subject} enabled={contact.enabled} siteKey={contact.enabled ? contact.siteKey : undefined}/>
      </ContactCinema>
    </div></section>
    <BeaconFinale copy={s.finale} terrace={<FinaleTerrace/>} tag={<ChapterTag code={chapterCode(6)} label={label(6)}/>}/>
    <div className="transmission-wrap"><EpilogueTransmission lang={lang} copy={s.transmission} epilogue={beyondOrbit[lang]}/></div>
    <AureliaEggs/><ProposalHarvest lang={lang}/><HomeChoreography/>
  </main>;
}
