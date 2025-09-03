import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-luxury-gold bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold/20",
        secondary: "border-luxury-navy bg-luxury-navy/10 text-luxury-navy hover:bg-luxury-navy/20",
        destructive: "border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20",
        outline: "border-gray-200 bg-transparent text-luxury-navy hover:bg-luxury-gold/5 hover:border-luxury-gold",
        luxury: "border-luxury-gold bg-gradient-luxury text-white shadow-luxury",
      },
      size: {
        default: "px-3 py-1.5 text-xs",
        sm: "px-2 py-1 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
