import * as React from "react"
import { cn } from "../../../lib/tiptap-utils"
import { css } from "styled-components";

export const SeparatorStyles = css`
.tiptap-separator {
  --tt-link-border-color: var(--tt-gray-light-a-200);

  .dark & {
    --tt-link-border-color: var(--tt-gray-dark-a-200);
  }
}

.tiptap-separator {
  flex-shrink: 0;
  background-color: var(--tt-link-border-color);

  &[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
    margin: 0.5rem 0;
  }

  &[data-orientation="vertical"] {
    height: 1.5rem;
    width: 1px;
  }
}
`;

export type Orientation = "horizontal" | "vertical"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ decorative, orientation = "vertical", className, ...divProps }, ref) => {
    const ariaOrientation = orientation === "vertical" ? orientation : undefined
    const semanticProps = decorative
      ? { role: "none" }
      : { "aria-orientation": ariaOrientation, role: "separator" }

    return (
      <div
        className={cn("tiptap-separator", className)}
        data-orientation={orientation}
        {...semanticProps}
        {...divProps}
        ref={ref}
      />
    )
  }
)

Separator.displayName = "Separator"
