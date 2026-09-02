import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps {
  className?: string;
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
  [key: string]: any;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-none border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2",
        {
          "border-transparent bg-[#D1FF26] text-black hover:bg-[#bce620]": variant === "default",
          "border-transparent bg-white/10 text-white hover:bg-white/20": variant === "secondary",
          "text-white border-white/20": variant === "outline",
          "border-transparent bg-red-500/20 text-red-400": variant === "destructive",
          "border-transparent bg-emerald-500/20 text-emerald-400": variant === "success",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
