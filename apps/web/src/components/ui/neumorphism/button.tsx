import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "#/components/lib/shadcn/utils"

const buttonVariants = cva(
  `
    inline-flex items-center justify-center rounded-xl text-sm font-medium
    transition-all select-none
    focus-visible:outline-none
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        default: `
          bg-nm-bg text-foreground shadow-nm-flat
          hover:shadow-nm-inset
          focus:shadow-nm-inset
          active:shadow-nm-inset
        `,
        secondary: `
          bg-secondary text-secondary-foreground shadow-nm-flat
          hover:shadow-nm-inset
        `,
        destructive: `
          bg-destructive text-destructive-foreground shadow-nm-flat
          hover:shadow-nm-inset
        `,
        outline: `
          border border-border bg-transparent shadow-nm-flat
          hover:bg-accent hover:text-accent-foreground hover:shadow-nm-inset
        `,
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
        inset: "bg-nm-bg text-foreground shadow-nm-inset",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
