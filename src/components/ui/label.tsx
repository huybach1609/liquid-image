import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority";

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  size?: "sm" | "md" | "lg";
}
const labelVariants = cva(
  "block text-xs text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)
function Label({
  size = "sm",
  className,
  ...props
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        labelVariants({ size }),
        className
      )}
      {...props}
    />
  )
}

export { Label }
