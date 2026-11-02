import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-teal-50 text-teal-800 border-teal-200",
    secondary: "bg-blue-50 text-blue-800 border-blue-200",
    outline: "bg-slate-100 text-slate-600 border-slate-200",
    destructive: "bg-red-50 text-red-700 border-red-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
