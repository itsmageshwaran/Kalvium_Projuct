"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

// Wraps the app in an eased smooth scroll. Respects prefers-reduced-motion by
// not instantiating Lenis, leaving native browser scrolling intact.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      allowNestedScroll: true,
      prevent: (node: any) => {
        if (!node || node.nodeType !== 1) return false;
        return Boolean(
          node.closest?.(
            "[data-lenis-prevent], [data-lenis-prevent-wheel], [role='dialog'], .modal-scroll-container, .overflow-y-auto, .overflow-auto"
          )
        );
      },
    });
    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      if ((window as any).__lenis === lenis) {
        delete (window as any).__lenis;
      }
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
