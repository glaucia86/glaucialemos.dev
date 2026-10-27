import { describe, expect, it, vi } from 'vitest';
import { createMusicController, MUSIC_TRACKS } from '@/lib/music';

describe('music playback', () => {
  it('starts only when enabled and visible, pauses for video, and switches worlds', async () => {
    const players: { src: string; loop: boolean; volume: number; currentTime: number; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> }[] = [];
    const controller = createMusicController(() => {
      const player = { src: '', loop: false, volume: 0, currentTime: 0, play: vi.fn(async () => {}), pause: vi.fn() };
      players.push(player); return player;
    });
    controller.sync({ world: 'observatory', enabled: false, visible: true, volume: .3 });
    expect(players).toHaveLength(0);
    controller.sync({ world: 'observatory', enabled: true, visible: true, volume: .3 });
    expect(players[0].src).toBe(MUSIC_TRACKS.observatory);
    expect(players[0].loop).toBe(true);
    expect(players[0].play).toHaveBeenCalledOnce();
    controller.block('tv', true);
    expect(players[0].pause).toHaveBeenCalled();
    controller.block('tv', false);
    expect(players[0].play).toHaveBeenCalledTimes(2);
    controller.sync({ world: 'niveora', enabled: true, visible: true, volume: .3 });
    expect(players.at(-1)?.src).toBe(MUSIC_TRACKS.niveora);
    controller.sync({ world: 'niveora', enabled: true, visible: false, volume: .3 });
    expect(players.at(-1)?.pause).toHaveBeenCalled();
  });

  it('allows independent blockers, stops on mute, and never loads another world while silent', () => {
    const players: { src: string; loop: boolean; volume: number; currentTime: number; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> }[] = [];
    const controller = createMusicController(() => {
      const player = { src: '', loop: false, volume: 0, currentTime: 0, play: vi.fn(async () => {}), pause: vi.fn() };
      players.push(player); return player;
    });
    controller.sync({ world: 'lumina', enabled: true, visible: true, volume: .2 });
    controller.block('tv', true); controller.block('theater', true);
    controller.block('tv', false);
    expect(players[0].play).toHaveBeenCalledOnce();
    controller.block('theater', false);
    expect(players[0].play).toHaveBeenCalledTimes(2);
    controller.sync({ world: 'aurelia', enabled: false, visible: true, volume: .2 });
    expect(players).toHaveLength(1);
    expect(players[0].pause).toHaveBeenCalled();
  });

  it('changes volume without restarting and pauses at zero', () => {
    const player = { src: '', loop: false, volume: 0, currentTime: 12, play: vi.fn(async () => {}), pause: vi.fn() };
    const controller = createMusicController(() => player);
    controller.sync({ world: 'atlas', enabled: true, visible: true, volume: .3 });
    controller.sync({ world: 'atlas', enabled: true, visible: true, volume: .6 });
    expect(player.volume).toBe(.6);
    expect(player.play).toHaveBeenCalledOnce();
    controller.sync({ world: 'atlas', enabled: true, visible: true, volume: 0 });
    expect(player.pause).toHaveBeenCalledOnce();
    controller.sync({ world: 'atlas', enabled: true, visible: true, volume: .4 });
    expect(player.play).toHaveBeenCalledTimes(2);
    expect(player.currentTime).toBe(12);
  });
});
