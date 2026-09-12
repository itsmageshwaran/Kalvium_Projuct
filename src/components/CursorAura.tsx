"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function CursorAura() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Outer ambient aura: floaty, fluid spring physics
  const springAuraX = useSpring(mouseX, { stiffness: 150, damping: 22, mass: 0.5 });
  const springAuraY = useSpring(mouseY, { stiffness: 150, damping: 22, mass: 0.5 });

  useEffect(() => {
    // Only activate for non-touch devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.classList.contains("interactive"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!mounted || shouldReduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Pure Ambient Coral-Amber Radiant Aura Glow */}
      <motion.div
        style={{
          x: springAuraX,
          y: springAuraY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isClicking ? 0.85 : isHovered ? 1.3 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute top-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none will-change-transform"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(232,73,45,0.22)_0%,rgba(245,158,11,0.12)_35%,rgba(232,73,45,0.03)_60%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(232,73,45,0.30)_0%,rgba(245,158,11,0.16)_38%,rgba(232,73,45,0.04)_62%,transparent_72%)] blur-[45px] mix-blend-multiply dark:mix-blend-screen" />
      </motion.div>
    </div>
  );
}
