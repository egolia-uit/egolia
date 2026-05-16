import { cn } from "#/components/lib/shadcn/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-nm-bg shadow-nm-inset border-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
