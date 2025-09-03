import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-luxury-gold text-white hover:bg-luxury-gold-dark shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1",
        outline: "border-2 border-luxury-gold text-luxury-gold bg-transparent hover:bg-luxury-gold hover:text-white shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1",
        secondary: "bg-luxury-navy text-white hover:bg-luxury-navy-light shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1",
        ghost: "text-luxury-navy hover:bg-luxury-gold/10 hover:text-luxury-gold",
        link: "text-luxury-gold underline-offset-4 hover:underline",
        luxury: "bg-gradient-luxury text-white shadow-luxury-lg hover:shadow-luxury-hover transform hover:-translate-y-2 hover:scale-105",
        "luxury-outline": "border-2 border-luxury-gold text-luxury-gold bg-transparent hover:bg-luxury-gold hover:text-white shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1",
        "luxury-ghost": "text-luxury-navy hover:bg-luxury-gold/5 hover:text-luxury-gold",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-6 py-2 text-sm",
        lg: "h-14 px-10 py-4 text-lg",
        xl: "h-16 px-12 py-5 text-xl",
        icon: "h-12 w-12",
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
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
