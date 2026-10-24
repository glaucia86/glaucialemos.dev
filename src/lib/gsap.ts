"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Flip, useGSAP);

export const DESKTOP = "(min-width: 901px)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const SCRAMBLE_CHARS = "█▓▒░<>/\\|=+*#01";

export { gsap, Flip, ScrollTrigger, SplitText, useGSAP };
