"use client";

import React from "react";

interface KalviumLogoProps {
  className?: string;
  size?: number;
}

export default function KalviumLogo({ className = "", size = 24 }: KalviumLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || "text-[#E5391F]"}
    >
      <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="16" />
      <path d="M 10 50 L 90 10" stroke="currentColor" strokeWidth="16" strokeLinejoin="miter" />
      <path d="M 10 50 L 90 90" stroke="currentColor" strokeWidth="16" strokeLinejoin="miter" />
    </svg>
  );
}
