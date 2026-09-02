import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-sm font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-mono",
          {
            "bg-[#D1FF26] text-black hover:bg-white": variant === "default",
            "border border-white/10 bg-transparent hover:bg-white/5 text-white hover:border-brand-accent": variant === "outline",
            "hover:bg-white/10 text-white/70 hover:text-white": variant === "ghost",
            "text-brand-accent underline-offset-4 hover:underline": variant === "link",
            "bg-red-500/10 text-red-500 hover:bg-red-500/20": variant === "danger",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
