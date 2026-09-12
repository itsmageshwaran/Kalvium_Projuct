import React from "react";

interface TerminalBadgeProps {
  variant?: "verified" | "amber" | "coral" | "cyan" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

export default function TerminalBadge({
  variant = "neutral",
  size = "sm",
  children,
  icon,
  className = "",
  showDot = true,
}: TerminalBadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 tracking-wider",
    md: "text-xs px-3 py-1 tracking-wider",
  };

  const variantStyles = {
    verified: "border-kalvium-success-border bg-kalvium-success-tint text-kalvium-success",
    amber: "border-kalvium-warning-border bg-kalvium-warning-tint text-kalvium-warning",
    coral: "border-kalvium-coral/30 bg-kalvium-coral-tint text-kalvium-coral",
    cyan: "border-kalvium-coral/30 bg-kalvium-coral-tint text-kalvium-coral",
    neutral: "border-kalvium-border dark:border-kalvium-dark-border text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt",
  };

  const dotStyles = {
    verified: "w-1.5 h-1.5 rounded-full bg-kalvium-success",
    amber: "w-1.5 h-1.5 rounded-full bg-kalvium-warning",
    coral: "w-1.5 h-1.5 rounded-full bg-kalvium-coral",
    cyan: "w-1.5 h-1.5 rounded-full bg-kalvium-coral",
    neutral: "w-1.5 h-1.5 rounded-full bg-kalvium-muted",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border select-none transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {showDot && <span className={dotStyles[variant]} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
