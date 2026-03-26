import * as React from "react";
import { cn } from "@/shared/cn";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return <div className={cn("rounded-2xl", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn(className)} {...props} />;
}