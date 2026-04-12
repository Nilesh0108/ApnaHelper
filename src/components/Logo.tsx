
"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className, iconClassName, size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("text-primary", sizes[size], iconClassName)}
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
        <path d="M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97L15.95 24l-3.97-3.97 5.44-5.42z" className="text-secondary" />
      </svg>
    </div>
  );
}
