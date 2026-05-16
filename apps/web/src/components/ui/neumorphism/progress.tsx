"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "#/components/lib/shadcn/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      `
        relative h-4 w-full overflow-hidden rounded-full bg-nm-bg
        shadow-nm-inset
      `,
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="
        h-full w-full flex-1 rounded-full bg-primary shadow-nm-flat-sm
        transition-all
      "
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
