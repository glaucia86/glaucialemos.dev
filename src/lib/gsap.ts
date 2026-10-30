"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";
import { CustomWiggle } from "gsap/CustomWiggle";
import { CustomBounce } from "gsap/CustomBounce";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Flip, MotionPathPlugin, Physics2DPlugin, Draggable, InertiaPlugin, CustomEase, CustomWiggle, CustomBounce, TextPlugin, useGSAP);

export const DESKTOP = "(min-width: 901px)";
// Cover composition and hero choreography apply to every screen.
export const HERO_OVERLAY = "(min-width: 0px)";
// Independent long-form journeys keep their existing desktop choreography.
export const WIDE_MOTION = "(min-width: 1200px) and (min-height: 680px) and (hover: hover) and (pointer: fine)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const SCRAMBLE_CHARS = "█▓▒░<>/\\|=+*#01";

export { gsap, Flip, ScrollTrigger, SplitText, Draggable, CustomEase, CustomWiggle, CustomBounce, useGSAP };

// A tall hero must be readable before its camera departs. Re-evaluated by
// ScrollTrigger on refresh (including rotation/font loading), in screen pixels.
export function heroScrollStart(hero: HTMLElement) {
  return hero.offsetHeight > window.innerHeight ? "bottom bottom" : "top top";
}
