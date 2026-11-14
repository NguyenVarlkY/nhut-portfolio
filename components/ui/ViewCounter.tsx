"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const VIEW_KEY = "nhut-portfolio:views";
const SESSION_KEY = "nhut-portfolio:viewed";

export default function ViewCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    try {
      const current = Number(localStorage.getItem(VIEW_KEY) ?? "0");
      const countedThisSession = sessionStorage.getItem(SESSION_KEY) === "1";
      const next = countedThisSession ? current : current + 1;

      if (!countedThisSession) {
        localStorage.setItem(VIEW_KEY, String(next));
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      setViews(next);
    } catch {
      // Storage can be unavailable in privacy mode; keep the UI quiet.
    }
  }, []);

  if (views === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" aria-label={`${views} portfolio views`}>
      <Eye size={14} aria-hidden="true" /> {views.toLocaleString()} views
    </span>
  );
}
