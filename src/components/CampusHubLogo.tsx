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
  variant = "full", // we ignore this now and just show the full logo provided
  size = "md",
  showTagline = false,
  className = "",
}: CampusHubLogoProps) {
  // We use wider sizes because this is a full horizontal logo
  const logoWidth = {
    sm: "w-32",
    md: "w-40",
    lg: "w-48",
    xl: "w-56",
  }[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Light mode icon */}
      <div className={`relative ${logoWidth} shrink-0 transition-transform duration-200 group-hover:scale-105 dark:hidden`}>
        <Image
          src="/brand/campus-hub-header-light.png?v=2"
          alt="CampusHub Logo"
          width={400}
          height={100}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
      {/* Dark mode icon */}
      <div className={`relative ${logoWidth} shrink-0 transition-transform duration-200 group-hover:scale-105 hidden dark:block`}>
        <Image
          src="/brand/campus-hub-header-dark.png?v=2"
          alt="CampusHub Logo"
          width={400}
          height={100}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </div>
  );
}
