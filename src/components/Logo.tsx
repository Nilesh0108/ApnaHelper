
"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

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

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden rounded-xl", sizes[size], className)}>
      <Image
        src="https://picsum.photos/seed/apnahelper-app-logo/512/512"
        alt="ApnaHelper Logo"
        fill
        className="object-contain"
        data-ai-hint="service person logo"
      />
    </div>
  );
}
