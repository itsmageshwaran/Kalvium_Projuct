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
    sm: "px-2.5 py-0.5 text-[11px] gap-1 font-semibold",
    md: "px-3 py-1 text-xs gap-1.5 font-semibold",
    lg: "px-4 py-1.5 text-sm gap-2 font-semibold",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const content = (
    <span
      className={`inline-flex items-center rounded-full border border-kalvium-success-border bg-kalvium-success-tint text-kalvium-success dark:bg-kalvium-dark-success-tint dark:border-emerald-900/40 dark:text-emerald-400 select-none transition-all duration-200 ${sizeClasses[size]} ${className}`}
      title={verifierName ? `Verified by ${verifierName}` : "Verified by Campus Staff"}
    >
      {showIcon && (
        <ShieldCheck
          size={iconSizes[size]}
          className="text-kalvium-success dark:text-emerald-400 shrink-0"
        />
      )}
      <span className="tracking-tight">Campus verified</span>
    </span>
  );

  if (!animate) return content;

  return (
    <motion.span
      initial={{ scale: 1.15, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      className="inline-block"
    >
      {content}
    </motion.span>
  );
}
