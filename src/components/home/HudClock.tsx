"use client";

import { useEffect, useState } from "react";

export function HudClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="hud-clock">{time}</span>;
}
