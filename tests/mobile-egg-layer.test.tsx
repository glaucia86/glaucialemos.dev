import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MOBILE_HOTSPOTS, type MobileWorld } from "../src/lib/mobile-eggs";
import { MobileEggLayer } from "../src/components/mobile/MobileEggLayer";

vi.mock("next/navigation", () => ({ useParams: () => ({ lang: "pt" }) }));

describe("mobile egg layer server boundary", () => {
  it.each(Object.keys(MOBILE_HOTSPOTS) as MobileWorld[])("renders nothing for %s before client media matching", world => {
    expect(renderToStaticMarkup(<MobileEggLayer world={world} projection="cover" />)).toBe("");
  });
});
