import type { SoundWorld } from './sfx';

export const MUSIC_TRACKS: Record<SoundWorld, string> = {
  observatory: '/music/observatorio.mp3', niveora: '/music/niveora.mp3', mars: '/music/marte.mp3',
  lumina: '/music/lumina.mp3', atlas: '/music/atlas.mp3', aurelia: '/music/aurelia.mp3', epilogue: '/music/epilogo.mp3',
};

type Player = Pick<HTMLAudioElement, 'src' | 'loop' | 'volume' | 'currentTime' | 'play' | 'pause'> & Partial<Pick<HTMLAudioElement, 'duration' | 'addEventListener'>>;
type State = { world?: SoundWorld; enabled: boolean; visible: boolean; volume: number };

export function createMusicController(makePlayer: () => Player) {
  let state: State = { enabled: false, visible: false, volume: .3 };
  let player: Player | undefined;
  let current: SoundWorld | undefined;
  let playing = false;
  const retiring = new Map<Player, ReturnType<typeof setInterval>>();
  const blockers = new Set<string>();
  const stopRetiring = () => { for (const [old, timer] of retiring) { clearInterval(timer); old.pause(); } retiring.clear(); };
  const fadeOut = (old: Player) => {
    const initial = old.volume;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      old.volume = initial * Math.max(0, 1 - step / 10);
      if (step >= 10) { clearInterval(timer); retiring.delete(old); old.pause(); }
    }, 40);
    retiring.set(old, timer);
  };
  const envelope = (active: Player) => {
    const duration = active.duration;
    const edge = duration && Number.isFinite(duration) ? Math.min(1, active.currentTime / .6, Math.max(0, duration - active.currentTime) / .6) : 1;
    active.volume = Math.max(0, Math.min(1, state.volume * edge));
  };
  const update = () => {
    const shouldPlay = state.enabled && state.visible && !!state.world && !blockers.size && state.volume > 0;
    if (current !== state.world) {
      if (player) { if (playing && shouldPlay) fadeOut(player); else player.pause(); }
      player = undefined; playing = false; current = state.world;
    }
    if (!shouldPlay) { stopRetiring(); if (playing) player?.pause(); playing = false; return; }
    if (!player) {
      player = makePlayer(); player.src = MUSIC_TRACKS[state.world!]; player.loop = true;
      const active = player;
      active.addEventListener?.('timeupdate', () => { if (player === active) envelope(active); });
    }
    envelope(player);
    if (!playing) {
      playing = true;
      const active = player;
      void active.play().catch(() => { if (player === active) playing = false; });
    }
  };
  return {
    sync(next: State) { state = next; update(); },
    block(reason: string, blocked: boolean) { if (blocked) blockers.add(reason); else blockers.delete(reason); update(); },
  };
}

let controller: ReturnType<typeof createMusicController> | undefined;
function getController() {
  if (typeof Audio === 'undefined') return undefined;
  return controller ??= createMusicController(() => { const audio = new Audio(); audio.preload = 'none'; return audio; });
}
export function syncMusic(state: State) { getController()?.sync(state); }
export function blockMusic(reason: string, blocked: boolean) { getController()?.block(reason, blocked); }
