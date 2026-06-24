"use client";

import * as React from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

/* Site-wide smooth scrolling. Disabled automatically for users who
   prefer reduced motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
