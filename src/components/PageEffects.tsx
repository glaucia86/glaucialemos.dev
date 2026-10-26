"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageEffects() {
  const pathname = usePathname();
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.reveal = "visible";
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .08 });
    // The home and the epilogue choreograph their own chapters with GSAP (a transform here would undo their pins).
    document.querySelectorAll("main:not(.home-page):not(.beyond-orbit) section:not(.page-hero), .timeline li").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
