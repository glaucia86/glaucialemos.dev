"use client";
import dynamic from "next/dynamic";
const EventGlobe = dynamic(() => import("./EventGlobe"), { ssr: false });
export function GlobeLoader({ markers }: { markers: { location: [number, number]; size: number }[] }) { return <EventGlobe markers={markers} />; }
