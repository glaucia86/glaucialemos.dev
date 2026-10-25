import { describe, expect, it } from "vitest";
import { ambientPoses, trailSample, TRAIL_DURATION } from "@/components/about/niveora-acting";

describe("atuação de Nivéora", () => {
  it("fareja, caminha, cava, revela, abana e retorna à posição aprovada", () => {
    expect(trailSample(0)).toMatchObject({ phase: "sniff", x: 76, revealed: false });
    expect(trailSample(2000)).toMatchObject({ phase: "walk", facing: "left" });
    expect(trailSample(4000)).toMatchObject({ phase: "dig", x: 68, revealed: false });
    expect(trailSample(5100)).toMatchObject({ phase: "wag", x: 68, revealed: true, tracks: 6 });
    expect(trailSample(7000)).toMatchObject({ phase: "return", facing: "right" });
    expect(trailSample(TRAIL_DURATION)).toMatchObject({ phase: "done", x: 76, facing: "left", pose: "stand" });
  });

  it("mantém todo o trajeto no patamar aprovado e as pegadas em ordem", () => {
    let tracks = 0;
    for (let t = 0; t <= TRAIL_DURATION; t += 30) {
      const frame = trailSample(t);
      expect(frame.x).toBeGreaterThanOrEqual(68);
      expect(frame.x).toBeLessThanOrEqual(76);
      expect(frame.y).toBe(80);
      expect(frame.tracks).toBeGreaterThanOrEqual(tracks);
      expect(frame.tracks).toBeLessThanOrEqual(6);
      tracks = frame.tracks;
    }
    expect(trailSample(0).tracks).toBe(0);
  });

  it("nevasca prevalece sobre rajada e hover; fora delas não há vida própria", () => {
    expect(ambientPoses(0, { storm: true, gust: true, wag: true })).toEqual({ glaucia: "cold-a", prince: "cold" });
    expect(ambientPoses(260, { storm: true })).toEqual({ glaucia: "cold-b", prince: "cold" });
    expect(ambientPoses(0, { gust: true, wag: true })).toEqual({ glaucia: "brace", prince: "wind" });
    expect(ambientPoses(0, {})).toEqual({ glaucia: "idle", prince: "stand" });
    expect(ambientPoses(100000, {})).toEqual({ glaucia: "idle", prince: "stand" });
    expect(ambientPoses(180, { wag: true }).prince).toBe("wag-b");
  });
});
