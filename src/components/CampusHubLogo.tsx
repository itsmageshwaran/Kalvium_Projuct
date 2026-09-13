"use client";

import React from "react";
import Image from "next/image";

interface CampusHubLogoProps {
  /**
   * "full" = Icon mark + "CampusHub" wordmark
   * "icon" = Just the official app icon mark
   * "horizontal" = Full logo with official subtitle tagline
   */
  variant?: "full" | "icon" | "horizontal";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

export default function CampusHubLogo({
  variant = "full",
  size = "md",
  showTagline = false,
  className = "",
}: CampusHubLogoProps) {
  // Size tokens
  const iconSize = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  const taglineSize = {
    sm: "text-[7.5px] tracking-[0.16em]",
    md: "text-[8.5px] tracking-[0.18em]",
    lg: "text-[10px] tracking-[0.2em]",
    xl: "text-xs tracking-[0.22em]",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Graduation Cap Mark (Adaptive Light / Dark Squircles) */}
      <div className={`relative ${iconSize} shrink-0 rounded-xl overflow-hidden shadow-soft-xs transition-transform duration-200 group-hover:scale-105`}>
        {/* Light Mode Official Brand Mark */}
        <Image
          src="/brand/app-icon-light.png"
          alt="CampusHub Logo"
          width={80}
          height={80}
          className="w-full h-full object-contain dark:hidden"
          priority
        />
        {/* Dark Mode Official Brand Mark */}
        <Image
          src="/brand/app-icon-dark.png"
          alt="CampusHub Logo"
          width={80}
          height={80}
          className="w-full h-full object-contain hidden dark:block"
          priority
        />
      </div>

      {/* Wordmark Lockup */}
      {variant !== "icon" && (
        <div className="flex flex-col justify-center">
          <div className={`flex items-baseline font-bold tracking-tight leading-none ${textSize}`}>
            <span className="text-kalvium-text dark:text-kalvium-dark-text transition-colors">
              Campus
            </span>
            <span className="text-kalvium-coral ml-0.5">
              Hub
            </span>
          </div>

          {/* Official Tagline: DISCOVER • ORGANIZE • BELONG */}
          {(showTagline || variant === "horizontal") && (
            <div
              className={`mt-1 font-sans font-bold uppercase text-kalvium-muted dark:text-kalvium-dark-muted flex items-center gap-1.5 ${taglineSize}`}
            >
              <span>DISCOVER</span>
              <span className="text-kalvium-coral text-[6px]">•</span>
              <span>ORGANIZE</span>
              <span className="text-kalvium-coral text-[6px]">•</span>
              <span>BELONG</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
