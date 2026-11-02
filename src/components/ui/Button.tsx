import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-blue-600 text-white hover:bg-blue-700 shadow-xs":
              variant === "default" || variant === "primary",
            "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700":
              variant === "outline",
            "hover:bg-slate-100 text-slate-600 hover:text-slate-900":
              variant === "ghost",
            "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200":
              variant === "danger",
            "h-9 px-3.5 py-2": size === "default",
            "h-8 px-2.5 text-xs": size === "sm",
            "h-10 px-5 text-sm": size === "lg",
            "h-8 w-8": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
