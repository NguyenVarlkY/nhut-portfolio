"use client";

import { useEffect, useState } from "react";

/**
 * ScrollProgress — thin gradient bar at the very top showing reading progress.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[200] h-[3px] w-full"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-primary-light to-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

