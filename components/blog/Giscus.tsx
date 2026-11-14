"use client";

import { useEffect, useRef } from "react";

export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.setAttribute("data-repo", process.env.NEXT_PUBLIC_GISCUS_REPO || "NguyenNhutY/nhut-portfolio");
    script.setAttribute("data-repo-id", process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "vi");
    script.setAttribute("crossorigin", "anonymous");

    // Only load giscus if IDs are provided
    if (process.env.NEXT_PUBLIC_GISCUS_REPO_ID && process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID) {
      ref.current.appendChild(script);
    }
  }, []);

  return <div ref={ref} className="mt-12" />;
}
