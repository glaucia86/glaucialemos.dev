import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServiceGarden } from '@/components/services/ServiceGarden';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getServicos } from '@/lib/data';
import { gardenRecords, serviceHref, servicePrice, advancePollination, turnRing, ringsAligned } from '@/lib/aurelia-records';
import { aurelia } from '@/i18n/aurelia';
import { comlink } from '@/i18n/comlink';
import { EGGS, matchPhrase, matchTail, normalizePhrase, type EggId } from '@/lib/eggs';
import { SCENES, poseBox } from '@/lib/scenes';
import { createGarden, PIXEL, MAX_PARTICLES } from '@/components/services/garden-engine';
import { createPetalJump } from '@/components/services/petal-jump';

const canvas = () => ({ clientWidth: 1440, clientHeight: 810, width: 0, height: 0, getContext: () => null }) as unknown as HTMLCanvasElement;
describe('Aurélia — registros e interações', () => {
  it('só apresenta serviços existentes, com assuntos reais do formulário', () => {
    expect(gardenRecords().map(r => r.service)).toEqual(getServicos());
    expect(gardenRecords().map(r => r.subject)).toEqual(['workshop', 'mentoria', 'palestra']);
    expect(() => gardenRecords([])).toThrow();
    for (const lang of ['pt', 'en', 'es'] as const) for (const record of gardenRecords()) {
      expect(serviceHref(lang, record.subject)).toBe(`/${lang}/servicos?assunto=${record.subject}#contato`);
      expect(servicePrice(record.service, lang)).toBeTruthy();
    }
  });
  it('renderiza todos os dados e links localizados sem depender de animação', () => {
    for (const lang of ['pt','en','es'] as const) {
      const html=renderToStaticMarkup(createElement(ServiceGarden,{records:gardenRecords(),copy:aurelia[lang].garden,lang,price:servicePrice(getServicos()[0],lang)}));
      for(const {service,subject} of gardenRecords()) {
        expect(html).toContain(service.titulo[lang]);
        expect(html).toContain(serviceHref(lang,subject));
        expect(html).toContain(servicePrice(service,lang));
      }
      expect(html).toContain('<details');
      expect(html).not.toContain('type="submit"');
    }
  });
  it('alinha os anéis em quartos de volta e exige a ordem dos canteiros', () => {
    expect(ringsAligned([1, 2, 3])).toBe(false);
    expect(ringsAligned([0, 0, 0])).toBe(true);
    expect(turnRing(3)).toBe(0);
    expect(advancePollination(0, 2, 3)).toBe(0);
    expect(advancePollination(1, 0, 3)).toBe(1);
    expect(advancePollination(1, 1, 3)).toBe(2);
    expect(advancePollination(2, 2, 3)).toBe(3);
    expect(advancePollination(3, 2, 3)).toBe(3);
  });
});
describe('Aurélia — catálogo e idiomas', () => {
  const ids = ['garden-bloom', 'beacon-relay', 'ring-alignment', 'seed-vault', 'greenhouse-dusk', 'pollination'];
  const leaves = (obj: unknown): string[] => typeof obj === 'object' && obj !== null ? Object.entries(obj).flatMap(([k,v]) => leaves(v).map(p => `${k}.${p}`)) : [''];
  it.each([
    ['garden-bloom', ['florescer', 'garden bloom', 'florecer']],
    ['beacon-relay', ['sinalizador', 'beacon', 'baliza']],
    ['ring-alignment', ['anéis', 'aneis', 'ANÉIS', 'rings', 'anillos']],
    ['seed-vault', ['sementes', 'seeds', 'semillas']],
    ['greenhouse-dusk', ['estufa', 'greenhouse', 'invernadero']],
    ['pollination', ['polinizar', 'pollinate', 'polinizar jardín']],
  ] as const)('reconhece %s pelas teclas das frases PT/EN/ES', (id, phrases) => {
    const allowed = ids as EggId[];
    for (const phrase of phrases) {
      let buffer = '';
      const emitted: EggId[] = [];
      for (const key of phrase) {
        buffer = (buffer + normalizePhrase(key)).slice(-24);
        const match = matchTail(buffer, allowed);
        if (match) { emitted.push(match); buffer = ''; }
      }
      expect(emitted).toEqual([id]);
      expect(matchPhrase(phrase, allowed)).toBe(id);
    }
  });
  it('registra seis segredos novos com nomes, dicas e comandos nos três idiomas', () => {
    expect(EGGS.filter(e => e.page === 'services').map(e => e.id)).toEqual([...ids, 'epilogue-signal']);
    for (const egg of EGGS.filter(e => ids.includes(e.id))) {
      for (const phrase of egg.phrases) expect(matchPhrase(phrase)).toBe(egg.id);
      for (const lang of ['pt','en','es'] as const) {
        expect(comlink[lang].eggs[egg.id].name.length).toBeGreaterThan(3);
        expect(comlink[lang].eggs[egg.id].hint.length).toBeGreaterThan(20);
      }
    }
  });
  it('tem copy completa e independente nos três idiomas', () => {
    expect(leaves(aurelia.en)).toEqual(leaves(aurelia.pt));
    expect(leaves(aurelia.es)).toEqual(leaves(aurelia.pt));
    for (const copy of Object.values(aurelia)) {
      expect(JSON.stringify(copy)).not.toMatch(/Vader|Bespin|Star Wars|gratuit|\bfree\b/i);
      expect(copy.discoveries).toContain('{n}/{total}');
    }
  });
  it('mantém os atores dentro da placa e fora da área de texto', () => {
    const scene = SCENES.aurelia;
    for (const [actor, poses] of [['glaucia',['idle','relaxed','side','blink']],['prince',['stand','paw']]] as const) for (const pose of poses) {
      const box = poseBox(scene,actor,pose);
      expect(box.left).toBeGreaterThan(58);
      expect(box.left + box.width).toBeLessThanOrEqual(100);
      expect(box.top + box.height).toBeCloseTo(93, 2);
    }
  });
});
describe('Aurélia — assets', () => {
  it('recorta magenta e mantém sprites com alpha e grade 1', async () => {
    const sharp=(await import('sharp')).default;
    for(const actor of ['glaucia','prince'] as const) for(const name of actor==='glaucia'?['idle','relaxed','side','blink']:['stand','paw']) {
      const sprite=(SCENES.aurelia.assets.actors[actor] as Record<string,{src:string;px:number[]}>)[name];
      const {data,info}=await sharp(`public${sprite.src}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      expect([info.width,info.height]).toEqual(sprite.px);
      let transparent=0,opaque=0,magenta=0;
      for(let i=0;i<data.length;i+=4){if(data[i+3]===0)transparent++;else {opaque++;if(data[i]>140&&data[i+1]<75&&data[i+2]>75&&data[i]>data[i+1]*2&&data[i+2]>data[i+1]*1.5)magenta++;}}
      expect(transparent).toBeGreaterThan(opaque*.05);expect(opaque).toBeGreaterThan(0);
      if(actor==='glaucia')expect(magenta).toBe(0);
    }
  });
});
describe('Aurélia — motores', () => {
  beforeEach(() => { vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} }); vi.stubGlobal('cancelAnimationFrame', vi.fn()); vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1)); });
  afterEach(() => vi.unstubAllGlobals());
  it('limita pixels e partículas, para o RAF e limpa os efeitos', () => {
    const back=canvas(),front=canvas(); const garden=createGarden({back,front});
    expect(back.width).toBe(Math.round(1440/PIXEL));
    for(let i=0;i<100;i++) garden.bloom({u:.8,v:.8});
    expect(garden.load()).toBeLessThanOrEqual(MAX_PARTICLES);
    garden.start(); garden.start(); expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    garden.stop(); expect(garden.load()).toBe(0);
    garden.destroy(); garden.start(); expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
  it('desenha com coordenadas inteiras e cancela o relógio ao parar', () => {
    const frames: FrameRequestCallback[]=[];
    vi.stubGlobal('requestAnimationFrame',vi.fn((fn:FrameRequestCallback)=>{frames.push(fn);return frames.length;}));
    const ctx={clearRect:vi.fn(),fillRect:vi.fn(),globalAlpha:1,fillStyle:'',imageSmoothingEnabled:true};
    const back={...canvas(),getContext:()=>ctx} as unknown as HTMLCanvasElement;
    const front={...canvas(),getContext:()=>ctx} as unknown as HTMLCanvasElement;
    const garden=createGarden({back,front});garden.start();garden.bloom({u:.8,v:.7});
    frames[0](100);frames[1](116);
    expect(ctx.fillRect).toHaveBeenCalled();
    for(const call of ctx.fillRect.mock.calls) expect(call.every(Number.isInteger)).toBe(true);
    expect(ctx.imageSmoothingEnabled).toBe(false);
    garden.destroy();expect(cancelAnimationFrame).toHaveBeenCalledWith(3);
    const queued=frames.length;frames[2](132);expect(frames).toHaveLength(queued);
  });
  it('salto aceita limites e NaN sem produzir progresso inválido', () => {
    const jump=createPetalJump(canvas());
    for(const value of [-1,0,.5,2,NaN]) expect(() => jump.set(value)).not.toThrow();
    jump.destroy();
  });
});
