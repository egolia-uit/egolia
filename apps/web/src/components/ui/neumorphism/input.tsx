import * as React from 'react';

import { cn } from '#/components/lib/shadcn/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `
            flex h-10 w-full rounded-xl border border-slate-200 bg-white px-4
            py-2 text-sm text-slate-950 ring-offset-background transition-colors
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-slate-400
            focus-visible:border-blue-400 focus-visible:ring-2
            focus-visible:ring-blue-500 focus-visible:outline-none
            disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50
          `,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
