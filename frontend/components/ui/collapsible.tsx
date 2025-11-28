"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { Slot } from "@radix-ui/react-slot"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

interface CollapsibleTriggerProps extends React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger> {
  asChild?: boolean;
}

function CollapsibleTrigger({
  className,
  children,
  ...props
}: CollapsibleTriggerProps) {
  // Check if asChild is used and handle it properly
  const { asChild, ...restProps } = props
  const hasChildren = React.Children.count(children) > 0

  if (asChild && hasChildren) {
    // When asChild is true, we pass the props to the child element using Slot
    return (
      <Slot
        data-slot="collapsible-trigger"
        className={cn(
          "flex items-center justify-between gap-2 py-2 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...restProps}
      >
        {children}
      </Slot>
    )
  }

  // Default behavior - render with default icon
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      className={cn(
        "flex items-center justify-between gap-2 py-2 font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...restProps}
    >
      {children}
      <ChevronDownIcon className="size-5 transition-transform duration-200" />
    </CollapsiblePrimitive.CollapsibleTrigger>
  )
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }