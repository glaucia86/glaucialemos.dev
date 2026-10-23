"use client";

import { useRef, useState, type ReactNode } from 'react';
import type { JourneyCopy } from '@/i18n/journey';
import type { HolonetCopy } from '@/i18n/holonet';
import { gsap, useGSAP } from '@/lib/gsap';
import { useMotionEnabled } from '@/lib/use-motion';
import { play } from '@/lib/sfx';

const BLOCKS = 16;
const FILE = 'chats-post.ts';
const QUESTIONS = { grounded: 'How can I ask for a refund?', ungrounded: 'What is the capital of France?' };

const K = ({ children }: { children: ReactNode }) => <span className="code-keyword">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="code-string">{children}</span>;
const C = ({ children }: { children: ReactNode }) => <span className="code-comment">{children}</span>;

// Excerpt of Azure-Samples/serverless-chat-langchainjs · packages/api/src/functions/chats-post.ts
function Excerpt({ grounded }: { grounded: boolean }) {
  const lines: ReactNode[] = [
    <C key="c">{'// ragSystemPrompt: "Answer ONLY with information from the sources below…"'}</C>,
    <><K>const</K>{' ragChain = '}<K>await</K>{' createStuffDocumentsChain({'}</>,
    <>{'  llm: model, '}<C>{'// AzureChatOpenAI'}</C></>,
    <>{'  prompt: ChatPromptTemplate.fromMessages(['}</>,
    <>{'    '}<S>{"['system', ragSystemPrompt]"}</S>{', '}<S>{"['human', '{input}']"}</S>{','}</>,
    <>{'  ]),'}</>,
    <>{'}); '}<C>{'// … RunnableWithMessageHistory → ragChainWithHistory'}</C></>,
    <><K>const</K>{' retriever = store.asRetriever('}<span className="code-type">3</span>{'); '}<C>{'// Cosmos DB'}</C></>,
    <><K>const</K>{' question = '}<span className={grounded ? 'code-valid' : 'code-error'}>{`"${grounded ? QUESTIONS.grounded : QUESTIONS.ungrounded}"`}</span>{';'}</>,
    <><K>const</K>{' responseStream = '}<K>await</K>{' ragChainWithHistory.stream({'}</>,
    <>{'  input: question, context: '}<K>await</K>{' retriever.invoke(question),'}</>,
    <>{'}, { configurable: { sessionId } });'}</>,
  ];
  return <pre><code>{lines.map((line, index) => <span key={index}><span className="code-line" aria-hidden="true">{index + 1}</span>{line}{index === lines.length - 1 ? <span className="terminal-caret" aria-hidden="true" /> : '\n'}</span>)}</code></pre>;
}

export function RagDemo({ copy, terminal }: { copy: JourneyCopy['demo']; terminal: HolonetCopy['holocron'] }) {
  const [grounded, setGrounded] = useState(false);
  const [runs, setRuns] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const motion = useMotionEnabled();

  // Typing reveal when the terminal first enters the viewport.
  useGSAP(() => {
    if (!motion) return;
    gsap.from('.demo-example:not([hidden]) pre', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'steps(6)', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } });
    gsap.from(root.current, { y: 40, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
  }, { scope: root, dependencies: [motion], revertOnUpdate: true });

  // Each run: a retrieval bar, then a glitch for the refused answer or a clean grounded pass.
  useGSAP(() => {
    if (!runs || !motion) return;
    gsap.timeline()
      .fromTo('.terminal-progress i', { autoAlpha: .15 }, { autoAlpha: 1, duration: .01, stagger: .025, ease: 'none' })
      .call(() => play(grounded ? 'success' : 'error'))
      .fromTo('.demo-example:not([hidden]) pre', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .5, ease: 'steps(5)' }, 0)
      .add(grounded
        ? gsap.fromTo(root.current, { '--terminal-glow': 1 }, { '--terminal-glow': 0, duration: 1.2, ease: 'power2.out' })
        : gsap.timeline().set(root.current, { attr: { 'data-glitch': 'true' } }).to(root.current, { keyframes: { x: [-6, 5, -3, 2, 0] }, duration: .35, ease: 'none' }).set(root.current, { attr: { 'data-glitch': 'false' } }, '+=.25'));
  }, { scope: root, dependencies: [runs], revertOnUpdate: false });

  const select = (value: boolean) => { setGrounded(value); setRuns((count) => count + 1); };
  const status = runs === 0 ? `> ${terminal.run} ${FILE}` : grounded ? `✓ ${terminal.grounded}` : `✕ ${terminal.refused}`;

  return <div ref={root} className="rag-demo" data-state={grounded ? 'valid' : 'invalid'} data-glitch="false">
    <noscript><style>{'.home-page .demo-controls{display:none}@layer base{.home-page .rag-demo .demo-example[hidden]{display:block!important}}'}</style></noscript>
    <div className="demo-topline"><span className="terminal-lights" aria-hidden="true"><i /><i /><i /></span><span>R2-UNIT // Azure-Samples/serverless-chat-langchainjs / {FILE}</span><span aria-hidden="true">RAG</span></div>
    <div className="demo-controls" role="group" aria-label={copy.title}>
      <button type="button" aria-pressed={!grounded} aria-controls="demo-ungrounded" onClick={() => select(false)}>{copy.ungrounded}</button>
      <button type="button" aria-pressed={grounded} aria-controls="demo-grounded" onClick={() => select(true)}>{copy.grounded}</button>
    </div>
    <div aria-live="polite" aria-atomic="true">
      {[false, true].map(valid => <div className="demo-example" id={valid ? 'demo-grounded' : 'demo-ungrounded'} key={String(valid)} hidden={grounded !== valid}>
        <h3 className="demo-state">{valid ? copy.grounded : copy.ungrounded}</h3>
        <Excerpt grounded={valid} />
        <dl className="demo-diagnostic"><div><dt>{copy.diagnostic}</dt><dd>{valid ? copy.groundedDiagnostic : copy.ungroundedDiagnostic}</dd></div><div><dt>{copy.result}</dt><dd>{valid ? copy.groundedResult : copy.ungroundedResult}</dd></div></dl>
      </div>)}
    </div>
    <div className="terminal-status" aria-hidden="true"><span>{status}</span><span className="terminal-progress">{Array.from({ length: BLOCKS }, (_, index) => <i key={index} />)}</span></div>
    <p className="demo-note">{copy.note}</p>
  </div>;
}
