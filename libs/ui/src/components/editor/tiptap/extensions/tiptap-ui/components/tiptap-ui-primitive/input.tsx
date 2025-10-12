"use client"

import * as React from "react"
import { cn } from "../../../lib/tiptap-utils"
import { css } from "styled-components"

export const InputStyles = css`
  --tiptap-input-placeholder: var(--tt-gray-light-a-400);

  .dark {
    --tiptap-input-placeholder: var(--tt-gray-dark-a-400);
  }

  .tiptap-input {
    display: block;
    width: 100%;
    height: 2rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 0.375rem 0.5rem;
    border-radius: 0.375rem;
    background: none;
    appearance: none;
    outline: none;

    &::placeholder {
      color: var(--tiptap-input-placeholder);
    }
  }

  .tiptap-input-clamp {
    min-width: 12rem;
    padding-right: 0;

    text-overflow: ellipsis;
    white-space: nowrap;

    &:focus {
      text-overflow: clip;
      overflow: visible;
    }
  }

  .tiptap-input-group {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }
`;

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} className={cn("tiptap-input", className)} {...props} />
  )
}

export function InputGroup({
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

