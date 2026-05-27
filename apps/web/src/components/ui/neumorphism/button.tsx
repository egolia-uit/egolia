import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '#/components/lib/shadcn/utils';

const buttonVariants = cva(
  `
    inline-flex items-center justify-center rounded-xl text-sm font-medium
    transition-colors select-none
    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
    focus-visible:outline-none
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        /* Primary CTA — blue */
        default: `
          bg-blue-600 text-white
          hover:bg-blue-700
          active:bg-blue-800
        `,
        /* Strong dark CTA */
        strong: `
          bg-slate-950 text-white
          hover:bg-slate-800
          active:bg-slate-900
        `,
        /* Muted secondary */
        secondary: `
          bg-slate-100 text-slate-900
          hover:bg-slate-200
          active:bg-slate-200
        `,
        /* Outlined */
        outline: `
          border border-slate-200 bg-white text-slate-700
          hover:bg-slate-50 hover:text-slate-900
          active:bg-slate-100
        `,
        /* Ghost */
        ghost: `
          text-slate-600
          hover:bg-slate-100 hover:text-slate-900
          active:bg-slate-200
        `,
        /* Destructive */
        destructive: `
          bg-red-600 text-white
          hover:bg-red-700
          active:bg-red-800
        `,
        /* Active / selected state — blue pill (replaces old inset) */
        inset: `
          border border-blue-100 bg-blue-50 text-blue-700
          hover:bg-blue-100
        `,
        /* Text link */
        link: `
          text-blue-600 underline-offset-4
          hover:underline
        `,
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-2xl px-8',
        icon: 'h-10 w-10',
        'icon-xs': 'h-6 w-6 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
