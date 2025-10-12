"use client"

import * as React from "react"
import "@feynote/api-services/components/tiptap-ui-primitive/input/input.scss"
import { cn } from "../../../lib/tiptap-utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} className={cn("tiptap-input", className)} {...props} />
  )
}

function InputGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("tiptap-input-group", className)} {...props}>
      {children}
    </div>
  )
}

export { Input, InputGroup }
