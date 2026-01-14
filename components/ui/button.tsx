import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-bold uppercase transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-4 border-black bg-yellow-400 hover:bg-yellow-500 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5",
        destructive:
          "border-4 border-black bg-red-500 text-white hover:bg-red-600 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5",
        outline:
          "border-4 border-black bg-white hover:bg-gray-100 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5",
        secondary:
          "border-4 border-black bg-gray-200 hover:bg-gray-300 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5",
        ghost: "border-2 border-black hover:bg-yellow-400",
        link: "text-black underline-offset-4 hover:underline font-bold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
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
  ({ className, variant, size, ...props }, ref) => {
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

