"use client";

import { useRef, useState } from 'react';
import type { JourneyCopy } from '@/i18n/journey';
import type { HolonetCopy } from '@/i18n/holonet';
import { gsap, useGSAP } from '@/lib/gsap';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';

const BLOCKS = 16;

export function TypeScriptDemo({ copy, terminal }: { copy: JourneyCopy['demo']; terminal: HolonetCopy['holocron'] }) {
  const [corrected, setCorrected] = useState(false);
  const [runs, setRuns] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();

  // Typing reveal when the terminal first enters the viewport.
  useGSAP(() => {
    if (!motion) return;
    gsap.from('.demo-example:not([hidden]) pre', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'steps(6)', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } });
    gsap.from(root.current, { y: 40, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  // Each run: a compile bar, then a glitch for the type error or a clean pass.
  useGSAP(() => {
    if (!runs || !motion) return;
    const result = corrected ? 'success' : 'error';
    gsap.timeline()
      .fromTo('.terminal-progress i', { autoAlpha: .15 }, { autoAlpha: 1, duration: .01, stagger: .025, ease: 'none' })
      .call(() => play(result))
      .fromTo('.demo-example:not([hidden]) pre', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .5, ease: 'steps(5)' }, 0)
      .add(corrected
        ? gsap.fromTo(root.current, { '--terminal-glow': 1 }, { '--terminal-glow': 0, duration: 1.2, ease: 'power2.out' })
        : gsap.timeline().set(root.current, { attr: { 'data-glitch': 'true' } }).to(root.current, { keyframes: { x: [-6, 5, -3, 2, 0] }, duration: .35, ease: 'none' }).set(root.current, { attr: { 'data-glitch': 'false' } }, '+=.25'));
  }, { scope: root, dependencies: [runs], revertOnUpdate: false });

  const select = (valid: boolean) => { setCorrected(valid); setRuns((count) => count + 1); };
  const status = runs === 0 ? `> ${terminal.run} soma.ts` : corrected ? `✓ ${terminal.compiled}` : `✕ ${terminal.failed}`;

  return <div ref={root} className="typescript-demo" data-state={corrected ? 'valid' : 'invalid'} data-glitch="false">
    <noscript><style>{'.home-page .demo-controls{display:none}@layer base{.home-page .typescript-demo .demo-example[hidden]{display:block!important}}'}</style></noscript>
    <div className="demo-topline"><span className="terminal-lights" aria-hidden="true"><i /><i /><i /></span><span>R2-UNIT // TypeScript / soma.ts</span><span aria-hidden="true">01 → 02</span></div>
    <div className="demo-controls" role="group" aria-label={copy.title}>
      <button type="button" aria-pressed={!corrected} aria-controls="demo-incorrect" onClick={() => select(false)}>{copy.incorrect}</button>
      <button type="button" aria-pressed={corrected} aria-controls="demo-corrected" onClick={() => select(true)}>{copy.corrected}</button>
    </div>
    <div aria-live="polite" aria-atomic="true">
      {[false, true].map(valid => <div className="demo-example" id={valid ? 'demo-corrected' : 'demo-incorrect'} key={String(valid)} hidden={corrected !== valid}>
        <h3 className="demo-state">{valid ? copy.corrected : copy.incorrect}</h3>
        <pre><code><span className="code-line" aria-hidden="true">1</span><span className="code-keyword">function</span>{' soma(a: '}<span className="code-type">number</span>{', b: '}<span className="code-type">number</span>{') {\n'}<span className="code-line" aria-hidden="true">2</span>{'  '}<span className="code-keyword">return</span>{' a + b;\n'}<span className="code-line" aria-hidden="true">3</span>{'}\n'}<span className="code-line" aria-hidden="true">4</span>{'\n'}<span className="code-line" aria-hidden="true">5</span><span className={valid ? 'code-valid' : 'code-error'}>{valid ? 'soma(2, 3);' : 'soma("2", 3);'}</span><span className="terminal-caret" aria-hidden="true" /></code></pre>
        <dl className="demo-diagnostic"><div><dt>{copy.diagnostic}</dt><dd>{valid ? copy.success : copy.error}</dd></div><div><dt>{copy.result}</dt><dd>{valid ? copy.sum : copy.coercion}</dd></div></dl>
      </div>)}
    </div>
    <div className="terminal-status" aria-hidden="true"><span>{status}</span><span className="terminal-progress">{Array.from({ length: BLOCKS }, (_, index) => <i key={index} />)}</span></div>
    <p className="demo-note">{copy.note}</p>
  </div>;
}
