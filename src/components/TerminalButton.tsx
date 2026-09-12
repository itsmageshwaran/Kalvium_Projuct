import React from "react";

interface TerminalButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  bracketed?: boolean;
}

export default function TerminalButton({
  variant = "primary",
  size = "md",
  children,
  icon,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  bracketed = false,
}: TerminalButtonProps) {
  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-xs px-5 py-2.5 gap-2",
    lg: "text-sm px-6 py-3 gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-kalvium-coral hover:bg-kalvium-coral-hover text-white border-transparent shadow-sm",
    secondary:
      "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text border-kalvium-border dark:border-kalvium-dark-border hover:bg-kalvium-border/30",
    outline:
      "bg-transparent text-kalvium-text dark:text-kalvium-dark-text border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral hover:text-kalvium-coral",
    danger:
      "bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral border-kalvium-coral/30 hover:bg-kalvium-coral hover:text-white",
    success:
      "bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint text-kalvium-success border-kalvium-success-border dark:border-kalvium-dark-success-border hover:bg-kalvium-success hover:text-white",
    ghost:
      "bg-transparent text-kalvium-muted dark:text-kalvium-dark-muted border-transparent hover:text-kalvium-text dark:hover:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-sans font-semibold rounded-full border transition-all duration-150 inline-flex items-center justify-center select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {bracketed ? (
        <span>
          <span className="opacity-40 mr-1">[</span>
          {children}
          <span className="opacity-40 ml-1">]</span>
        </span>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
