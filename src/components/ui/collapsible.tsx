
import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, children, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  >
    {React.isValidElement(children) ? children : <span>{children}</span>}
    {showIcon && (
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
    )}
  </CollapsiblePrimitive.CollapsibleTrigger>
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      "overflow-hidden text-sm data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down",
      className
    )}
    {...props}
  >
    <div className="w-full">{children}</div>
  </CollapsiblePrimitive.CollapsibleContent>
))
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
