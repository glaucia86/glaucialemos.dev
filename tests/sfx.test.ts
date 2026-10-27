import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MIN_GAP, allowed, soundBank, uiSound } from "@/lib/sfx";

describe("sons dos mundos", () => {
  it("cada mundo migrado tem a sua voz de hover e clique; os outros mantêm a original", () => {
    expect(uiSound("observatory", "hover")).toBe("hover-observatory");
    expect(uiSound("niveora", "click")).toBe("click-niveora");
    expect(uiSound("mars", "hover")).toBe("hover-mars");
    expect(uiSound(undefined, "hover")).toBe("blip");
    expect(uiSound("lumina", "hover")).toBe("hover-lumina");
    expect(uiSound("nevarro", "click")).toBe("key");
    for (const world of ["observatory", "niveora", "mars", "lumina", "aurelia"]) for (const action of ["hover", "click"] as const) expect(soundBank[uiSound(world, action)].length).toBeGreaterThan(0);
  });

  it("Aurélia usa tons opt-in curtos e suaves", () => {
    expect(uiSound("aurelia", "hover")).toBe("hover-aurelia");
    for(const kind of ["garden-bloom", "relay", "seed", "greenhouse", "align-aurelia", "hover-aurelia", "click-aurelia"] as const) for(const tone of soundBank[kind]) {
      expect(tone.gain).toBeLessThanOrEqual(.08);
      expect((tone.delay ?? 0) + tone.duration).toBeLessThanOrEqual(.6);
    }
  });

  it("os novos kinds de ambiência têm fallback synth curto e suave", () => {
    for (const kind of ["observatory", "red-dunes", "crystal-hum", "orbit-hum", "veil", "snow-bed"] as const) {
      expect(soundBank[kind].length).toBeGreaterThan(0);
      expect(soundBank[kind].length).toBeLessThanOrEqual(2);
      for (const tone of soundBank[kind]) {
        expect(tone.gain).toBeLessThanOrEqual(.08);
        expect((tone.delay ?? 0) + tone.duration).toBeLessThanOrEqual(.6);
      }
    }
  });

  it("não empilha teclas: respeita o intervalo mínimo de cada som", () => {
    const played = new Map();
    expect(allowed("type", 1000, played)).toBe(true);
    expect(allowed("type", 1000 + MIN_GAP.type! - 1, played)).toBe(false);
    expect(allowed("type", 1000 + MIN_GAP.type!, played)).toBe(true);
    expect(allowed("success", 1000, played)).toBe(true);
    expect(allowed("success", 1000, played)).toBe(true);
  });

  it("o terminal de Marte tem digitação, retorno, disquete e CRT, todos curtos", () => {
    for (const kind of ["type", "return", "disk-in", "disk-out", "crt-on", "dig"] as const) {
      expect(soundBank[kind].length, kind).toBeGreaterThan(0);
      for (const tone of soundBank[kind]) expect((tone.delay ?? 0) + tone.duration, kind).toBeLessThanOrEqual(.6);
    }
    expect(soundBank.type.some((tone) => tone.wave === "noise")).toBe(true);
  });

  it("o epílogo tem voz própria e uma sequência de impacto, toda curta", () => {
    expect(uiSound("epilogue", "hover")).toBe("hover-epilogue");
    expect(uiSound("epilogue", "click")).toBe("click-epilogue");
    for (const kind of ["implode", "nova", "shimmer", "bloom", "star-ping", "slam", "credits-chord", "transmission", "dive", "hover-epilogue", "click-epilogue"] as const) {
      expect(soundBank[kind].length, kind).toBeGreaterThan(0);
      for (const tone of soundBank[kind]) expect((tone.delay ?? 0) + tone.duration, kind).toBeLessThanOrEqual(.6);
    }
    expect(soundBank.nova.some((tone) => tone.from < 100 && tone.wave === "sine")).toBe(true);
  });

  it("Lúmina tem cristal, página, prisma, scanner, eco, entardecer e o túnel, todos curtos", () => {
    for (const kind of ["chime", "page", "prism", "scanner", "echo", "link", "dusk", "refract", "facet", "hover-lumina", "click-lumina"] as const) {
      expect(soundBank[kind].length, kind).toBeGreaterThan(0);
      for (const tone of soundBank[kind]) expect((tone.delay ?? 0) + tone.duration, kind).toBeLessThanOrEqual(.6);
    }
  });
});

// Real lifecycle and loading paths with a small Web Audio mock, no browser/server required.
const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelAndHoldAtTime: vi.fn() });
const node = () => ({ connect: vi.fn(function (target: unknown) { return target; }), disconnect: vi.fn() });
class Source {
  buffer: { duration: number; sample?: boolean } | null = null;
  loop = false;
  playbackRate = param(); detune = param(); frequency = param();
  connect = node().connect; disconnect = vi.fn();
  onended: (() => void) | null = null;
  started = false;
  start = vi.fn(() => { this.started = true; });
  stop = vi.fn(() => { if (!this.started) throw new Error('stop before start'); });
}
class AudioMock {
  static instance: AudioMock;
  currentTime = 0; sampleRate = 100; state = 'suspended'; destination = {};
  sources: Source[] = []; oscillators: Source[] = [];
  gains: (ReturnType<typeof node> & { gain: ReturnType<typeof param> })[] = [];
  constructor() { AudioMock.instance = this; }
  createGain() { const gain = { ...node(), gain: param() }; this.gains.push(gain); return gain; }
  createBufferSource() { const source = new Source(); this.sources.push(source); return source; }
  createOscillator() { const source = new Source(); this.oscillators.push(source); return source; }
  createBiquadFilter() { return { ...node(), frequency: param(), Q: param() }; }
  createBuffer() { return { duration: 1, getChannelData: () => new Float32Array(100) }; }
  decodeAudioData = vi.fn(async () => ({ duration: 20, sample: true }));
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
}

describe('hybrid audio lifecycle', () => {
  let sfx: typeof import('@/lib/sfx');
  let doc: EventTarget & { hidden: boolean };
  let request: ReturnType<typeof vi.fn>;
  const flush = async () => { for (let index = 0; index < 12; index++) await Promise.resolve(); };
  const samples = () => AudioMock.instance.sources.filter(source => source.buffer?.sample);
  const visibility = (hidden: boolean) => { doc.hidden = hidden; doc.dispatchEvent(new Event('visibilitychange')); };

  beforeEach(async () => {
    vi.resetModules(); vi.useFakeTimers();
    const storage = new Map<string, string>();
    const win = Object.assign(new EventTarget(), { localStorage: { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) } });
    doc = Object.assign(new EventTarget(), { hidden: false });
    vi.stubGlobal('window', win); vi.stubGlobal('document', doc); vi.stubGlobal('AudioContext', AudioMock);
    request = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    vi.stubGlobal('fetch', request);
    sfx = await import('@/lib/sfx');
  });
  afterEach(() => { sfx.setSoundEnabled(false); vi.restoreAllMocks(); vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('stores separate music and effects levels without turning sound on', () => {
    sfx.setAudioLevels({ music: .2, effects: .7 });
    expect(sfx.isSoundEnabled()).toBe(false);
    expect(sfx.getAudioLevels()).toEqual({ music: .2, effects: .7 });
    expect(JSON.parse(window.localStorage.getItem('galaxia-audio-levels')!)).toEqual({ music: .2, effects: .7 });
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    ['aurelia', 'garden-ambience', .08], ['observatory', 'observatory-ambience', .07],
    ['niveora', 'wind', .08], ['mars', 'mars-ambience', .07], ['lumina', 'lumina-ambience', .07],
    ['atlas', 'atlas-ambience', .07], ['epilogue', 'epilogue-ambience', .07],
  ] as const)('starts %s ambience only after opt-in, including with reduced motion', async (world, file, gain) => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    sfx.setSoundWorld(world); await flush();
    expect(request).not.toHaveBeenCalled();
    sfx.setSoundEnabled(true); await flush();
    expect(request.mock.calls.map(call => call[0])).toEqual([`/sfx/${file}.ogg`]);
    expect(samples()).toHaveLength(1);
    expect(samples()[0].loop).toBe(true);
    expect(AudioMock.instance.gains.at(-1)!.gain.linearRampToValueAtTime).toHaveBeenCalledWith(gain, .6);
    sfx.setSoundWorld(world); await flush();
    expect(samples()).toHaveLength(1);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('crossfades world voices over .5 seconds and the new loop over .6, clearing old offsets', async () => {
    sfx.setSoundWorld('observatory'); sfx.setSoundEnabled(true); await flush();
    const oldLoop = samples()[0], oldEnvelope = AudioMock.instance.gains.at(-1)!.gain;
    sfx.play('key'); const key = AudioMock.instance.oscillators.at(-1)!;
    AudioMock.instance.currentTime = 3;
    sfx.setSoundWorld('atlas'); await flush();
    expect(oldLoop.stop).toHaveBeenLastCalledWith(3.5);
    expect(key.stop).toHaveBeenLastCalledWith(3.5);
    expect(oldEnvelope.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 3.5);
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/observatory-ambience.ogg', '/sfx/atlas-ambience.ogg']);
    expect(samples()[1].start).toHaveBeenCalledWith(3, 0);
    expect(AudioMock.instance.gains.at(-1)!.gain.linearRampToValueAtTime).toHaveBeenCalledWith(.07, 3.6);
    sfx.setSoundWorld('observatory'); await flush();
    expect(samples().at(-1)!.start).toHaveBeenCalledWith(3, 0);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('snow-bed is an optional Nivéora loop alongside the default wind', async () => {
    sfx.setSoundWorld('niveora'); sfx.setSoundEnabled(true); await flush();
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/wind.ogg']);
    sfx.play('snow-bed'); await flush();
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/wind.ogg', '/sfx/snow-ambience.ogg']);
    expect(samples()).toHaveLength(2);
    expect(samples()[1].loop).toBe(true);
    sfx.stop('snow-bed');
    expect(samples()[1].stop).toHaveBeenCalled();
    expect(samples()[0].stop).not.toHaveBeenCalled();
  });

  it.each([
    ['comet', 'observatory', 'comet-whoosh', 2], ['thunder', 'niveora', 'thunder', 4],
    ['gust-dust', 'mars', 'dust-storm', 1.8], ['dig', 'mars', 'rover', 1],
    ['holo', 'atlas', 'hologram', 1], ['descent', 'atlas', 'travel', 1.6],
    ['dive', 'epilogue', 'space-pulse', 2.5], ['chime', 'lumina', 'crystal-chime', 1.8],
    ['bloom', 'aurelia', 'bloom-chime', 2], ['garden-bloom', 'aurelia', 'bloom-chime', 2],
    ['relay', 'aurelia', 'beacon', 2], ['beacon-sample', 'aurelia', 'beacon', 2],
  ] as const)('%s loads only in %s from %s and caps playback at %s seconds', async (kind, world, file, duration) => {
    vi.spyOn(performance, 'now').mockReturnValue(0);
    sfx.setSoundEnabled(true); sfx.play(kind); await flush();
    expect(request).not.toHaveBeenCalled();
    sfx.setSoundWorld(world); await flush();
    vi.spyOn(performance, 'now').mockReturnValue(5000);
    sfx.play(kind); await flush();
    expect(request).toHaveBeenLastCalledWith(`/sfx/${file}.ogg`);
    expect(samples()).toHaveLength(1); // Cold one-shots use synth immediately, never a delayed sample.
    vi.spyOn(performance, 'now').mockReturnValue(10000);
    sfx.play(kind);
    expect(samples()).toHaveLength(2);
    expect(samples()[1].loop).toBe(false);
    expect(samples()[1].stop).toHaveBeenCalledWith(duration);
  });

  it('bloom in the epilogue stays synthesized, without fetching bloom-chime', async () => {
    sfx.setSoundWorld('epilogue'); sfx.setSoundEnabled(true); await flush();
    const before = AudioMock.instance.oscillators.length;
    sfx.play('bloom'); await flush();
    expect(AudioMock.instance.oscillators.length).toBeGreaterThan(before);
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/epilogue-ambience.ogg']);
    expect(samples()).toHaveLength(1);
  });

  it('defaults OFF: neither fetch/decode nor loops start before opt-in, even with loop requests', async () => {
    sfx.setSoundWorld('aurelia'); sfx.play('garden'); sfx.play('bloom');
    expect(sfx.isSoundEnabled()).toBe(false);
    await flush(); expect(request).not.toHaveBeenCalled();
    sfx.setSoundEnabled(true); await flush();
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/garden-ambience.ogg']);
    expect(samples()).toHaveLength(1); expect(samples()[0].loop).toBe(true);
  });

  it('loads/decode on demand only within the current world; UI stays synthesized; aliases share the cache', async () => {
    sfx.setSoundWorld('aurelia'); sfx.setSoundEnabled(true); await flush();
    const decoded = AudioMock.instance.decodeAudioData.mock.calls.length;
    sfx.play('hover-aurelia'); sfx.play('relay'); sfx.play('beacon-sample');
    await flush();
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/garden-ambience.ogg', '/sfx/beacon.ogg']);
    expect(AudioMock.instance.decodeAudioData).toHaveBeenCalledTimes(decoded + 1);
    sfx.play('beacon-sample'); const beacon = samples().at(-1)!;
    expect(beacon.loop).toBe(false); expect(beacon.stop).toHaveBeenCalledWith(2);
    sfx.play('relay'); expect(beacon.stop).toHaveBeenLastCalledWith(.08);
    sfx.play('thunder'); await flush(); expect(request).toHaveBeenCalledTimes(2);
    sfx.setSoundWorld('epilogue'); sfx.play('bloom'); await flush();
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/garden-ambience.ogg', '/sfx/beacon.ogg', '/sfx/epilogue-ambience.ogg']);
    sfx.setSoundWorld('aurelia'); await flush(); expect(request).toHaveBeenCalledTimes(3);
  });

  it.each(['decode', 'network', 'http'])('falls back from Opus to MP3 on %s failure', async failure => {
    sfx.setSoundWorld('observatory'); sfx.setSoundEnabled(true); await flush();
    if (failure === 'decode') AudioMock.instance.decodeAudioData.mockRejectedValueOnce(new Error('Opus unavailable'));
    if (failure === 'network') request.mockRejectedValueOnce(new Error('network'));
    if (failure === 'http') request.mockResolvedValueOnce({ ok: false });
    sfx.play('comet'); await flush();
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/observatory-ambience.ogg', '/sfx/comet-whoosh.ogg', '/sfx/comet-whoosh.mp3']);
    vi.spyOn(performance, 'now').mockReturnValue(5000);
    sfx.play('comet'); expect(samples()).toHaveLength(2);
    expect(samples()[1].stop).toHaveBeenCalledWith(2);
  });

  it('keeps synth feedback if both formats fail, without refetching or delayed one-shots', async () => {
    sfx.setSoundWorld('aurelia'); sfx.setSoundEnabled(true); await flush();
    request.mockRejectedValue(new Error('offline'));
    sfx.play('bloom'); await flush();
    const before = AudioMock.instance.oscillators.length;
    sfx.play('garden-bloom'); await flush();
    expect(AudioMock.instance.oscillators.length).toBeGreaterThan(before);
    expect(request.mock.calls.map(call => call[0])).toEqual(['/sfx/garden-ambience.ogg', '/sfx/bloom-chime.ogg', '/sfx/bloom-chime.mp3']);
    expect(samples()).toHaveLength(1); // Only the ambience, never a delayed success sound.
  });

  it('pauses on hidden, resumes the loop offset, and never resumes an old one-shot', async () => {
    sfx.setSoundWorld('aurelia'); sfx.setSoundEnabled(true); await flush();
    sfx.play('relay'); await flush(); sfx.play('relay');
    const [garden, beacon] = samples();
    AudioMock.instance.currentTime = 3;
    visibility(true);
    expect(garden.stop).toHaveBeenLastCalledWith(3); expect(beacon.stop).toHaveBeenLastCalledWith(3);
    expect(AudioMock.instance.suspend).toHaveBeenCalledTimes(1);
    const voices = AudioMock.instance.oscillators.length;
    sfx.play('blip'); sfx.play('bloom'); await flush();
    expect(AudioMock.instance.oscillators).toHaveLength(voices); expect(request).toHaveBeenCalledTimes(2);
    visibility(false); await flush();
    expect(samples()).toHaveLength(3); expect(samples()[2].start).toHaveBeenCalledWith(3, 3);
    expect(samples()[2].loop).toBe(true);
  });

  it('mute stops synth and samples, fades master, and cannot be bypassed by visibility or play', async () => {
    sfx.setSoundWorld('niveora'); sfx.setSoundEnabled(true); await flush();
    sfx.play('blizzard'); await flush();
    const storm = samples().at(-1)!;
    sfx.play("key"); const key = AudioMock.instance.oscillators.at(-1)!;
    sfx.setSoundEnabled(false); vi.advanceTimersByTime(60);
    expect(storm.stop).toHaveBeenLastCalledWith(.04);
    expect(AudioMock.instance.gains[0].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, .04);
    expect(key.stop).toHaveBeenLastCalledWith(.04);
    const count = samples().length;
    visibility(true); visibility(false); sfx.play('blizzard'); sfx.play('thunder'); await flush();
    expect(samples()).toHaveLength(count); expect(request).toHaveBeenCalledTimes(2);
    sfx.setSoundEnabled(true); await flush(); expect(samples()).toHaveLength(count + 1);
    sfx.stop('blizzard'); await flush();
    expect(samples().at(-1)!.buffer).toBe(samples()[0].buffer); // Calm wind returns.
  });

  it('view exit stops ambience, re-entry resumes it, and route changes clear storm intent', async () => {
    sfx.setSoundWorld('niveora', false); sfx.setSoundEnabled(true); await flush();
    expect(request).not.toHaveBeenCalled();
    sfx.setSoundWorld('niveora', true); await flush(); sfx.play('blizzard'); await flush();
    const storm = samples().at(-1)!;
    sfx.setSoundWorld('niveora', false); expect(storm.stop).toHaveBeenCalled();
    const count = samples().length;
    sfx.setSoundWorld('niveora', true); expect(samples()).toHaveLength(count + 1);
    sfx.setSoundWorld('mars'); sfx.setSoundWorld('niveora');
    expect(samples().at(-1)!.buffer).toBe(samples()[0].buffer);
  });

  it.each(['mute', 'hidden', 'route', 'stop', 'view exit'])('does not start a pending decode after %s', async action => {
    sfx.setSoundEnabled(true);
    let resolve!: (value: { duration: number; sample: boolean }) => void;
    AudioMock.instance.decodeAudioData.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    sfx.setSoundWorld('niveora'); await flush();
    if (action === 'mute') sfx.setSoundEnabled(false);
    if (action === 'hidden') visibility(true);
    if (action === 'route') sfx.setSoundWorld('mars');
    if (action === 'stop') sfx.stop('wind');
    if (action === 'view exit') sfx.setSoundWorld('niveora', false);
    const pendingBuffer = { duration: 20, sample: true };
    resolve(pendingBuffer); await flush();
    expect(samples().some(source => source.buffer === pendingBuffer)).toBe(false);
    expect(samples()).toHaveLength(action === 'route' ? 1 : 0);
  });

  it('limits sample gain even with a caller multiplier and caps thunder at four seconds', async () => {
    sfx.setSoundWorld('niveora'); sfx.setSoundEnabled(true); await flush();
    sfx.play('thunder'); await flush();
    vi.spyOn(performance, 'now').mockReturnValue(5000);
    sfx.play('thunder', { gain: 100 });
    expect(samples().at(-1)!.stop).toHaveBeenCalledWith(4);
    const envelope = AudioMock.instance.gains.at(-1)!.gain;
    expect(envelope.linearRampToValueAtTime).toHaveBeenCalledWith(.12, .025);
    expect(Object.values(sfx.sampleBank).every(sample => sample.gain <= .15)).toBe(true);
  });
});
