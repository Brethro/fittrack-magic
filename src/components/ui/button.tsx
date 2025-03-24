
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "pink-purple-gradient text-primary-foreground shadow-md hover:shadow-[0_5px_15px_rgba(191,90,242,0.4)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/10 bg-black/20 backdrop-blur-md hover:bg-white/5 hover:text-white",
        secondary:
          "bg-secondary/80 backdrop-blur-md text-secondary-foreground hover:bg-secondary/60",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glassmorphism hover:bg-black/30",
        accent: "gradient-accent text-white shadow-md hover:shadow-[0_5px_15px_rgba(191,90,242,0.4)]",
        purple: "purple-glass text-white hover:opacity-90 shadow-md hover:shadow-[0_5px_15px_rgba(191,90,242,0.4)]",
        dark: "dark-glass text-white hover:bg-black/20",
        gradient: "purple-pink-gradient text-white shadow-md hover:shadow-[0_5px_15px_rgba(191,90,242,0.4)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
        pill: "h-9 rounded-full px-4",
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
    const Comp = asChild ? Slot : "button"
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
