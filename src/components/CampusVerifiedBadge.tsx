"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface CampusVerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
  verifierName?: string;
  animate?: boolean;
}

export default function CampusVerifiedBadge({
  size = "md",
  showIcon = true,
  className = "",
  verifierName,
  animate = false,
}: CampusVerifiedBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-[10px] gap-1",
    md: "px-3 py-1.5 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const content = (
    <span
      className={`inline-flex items-center border border-[#111111]/20 bg-[#F7F7F5] text-[#111111] font-bold uppercase tracking-widest select-none rounded-full ${sizeClasses[size]} ${className}`}
      title={verifierName ? `Verified by ${verifierName}` : "Verified by Campus Staff"}
    >
      {showIcon && (
        <ShieldCheck
          size={iconSizes[size]}
          className="text-[#E5391F] shrink-0"
          strokeWidth={3}
        />
      )}
      <span>Campus verified</span>
    </span>
  );

  if (!animate) return content;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-block"
    >
      {content}
    </motion.span>
  );
}
