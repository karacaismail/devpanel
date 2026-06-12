import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600 text-white",
        secondary: "border-transparent bg-neutral-700 text-neutral-200",
        success: "border-transparent bg-emerald-600/20 text-emerald-400",
        destructive: "border-transparent bg-red-600/20 text-red-400",
        outline: "border-neutral-700 text-neutral-300",
        warning: "border-transparent bg-amber-600/20 text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
