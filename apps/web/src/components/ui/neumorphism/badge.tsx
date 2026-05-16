import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#/components/lib/shadcn/utils"

const badgeVariants = cva(
  `
    inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
    transition-all
    focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none
  `,
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-nm-bg text-foreground shadow-nm-flat-sm",
        secondary:
          `
            border-transparent bg-secondary text-secondary-foreground
            shadow-nm-flat-sm
          `,
        destructive:
          `
            border-transparent bg-destructive text-destructive-foreground
            shadow-nm-flat-sm
          `,
        outline: "border border-border text-foreground shadow-nm-flat-sm",
        inset: "border-none bg-nm-bg text-foreground shadow-nm-inset",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
