"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-full border transition-all duration-150 active:scale-95 flex items-center justify-center border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface hover:border-kalvium-coral text-kalvium-ink dark:text-kalvium-dark-ink shadow-soft-xs ${className}`}
      title={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
      aria-label={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`w-4 h-4 absolute inset-0 transition-transform duration-500 ease-out ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-kalvium-coral"
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute inset-0 transition-transform duration-500 ease-out ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-kalvium-warning"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}
