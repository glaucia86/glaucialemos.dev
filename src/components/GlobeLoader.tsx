"use client";
import dynamic from "next/dynamic";
import type { EventGlobeProps } from "./EventGlobe";
const EventGlobe = dynamic(() => import("./EventGlobe"), { ssr: false, loading: () => <div className="globe-placeholder" aria-hidden="true" /> });
export function GlobeLoader(props: EventGlobeProps) { return <EventGlobe {...props} />; }
