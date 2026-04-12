"use client";

import { cn } from "@/lib/utils";
import { Home, Wrench } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20",
    xl: "h-32 w-32",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-12 w-12",
    xl: "h-20 w-20",
  };

  const subIconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-7 w-7",
    xl: "h-10 w-10",
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center rounded-2xl bg-primary shadow-inner transition-all duration-300", 
      sizes[size], 
      className
    )}>
      <Home className={cn("text-white", iconSizes[size])} strokeWidth={2.5} />
      <div className={cn(
        "absolute -bottom-1 -right-1 bg-secondary rounded-lg border-2 border-primary p-0.5 shadow-lg",
      )}>
        <Wrench className={cn("text-white", subIconSizes[size])} strokeWidth={3} />
      </div>
    </div>
  );
}
