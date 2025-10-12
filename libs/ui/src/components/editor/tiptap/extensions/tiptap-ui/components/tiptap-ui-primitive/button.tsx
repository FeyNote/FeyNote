import * as React from "react"

import { cn, parseShortcutKeys } from "../../lib/tiptap-utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import styled, { css } from "styled-components"

const StyledButtonGroup = styled.div`
  position: relative;
  display: flex;
  vertical-align: middle;

  &[data-orientation="vertical"] {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    min-width: max-content;

    > .tiptap-button {
      width: 100%;
    }
  }

  &[data-orientation="horizontal"] {
    gap: 0.125rem;
    flex-direction: row;
    align-items: center;
  }
`;

export const StyledButton = styled.button`
  /**************************************************
      Default button background color
  **************************************************/

  /* Light mode */
  --tt-button-default-bg-color: var(--tt-gray-light-a-100);
  --tt-button-hover-bg-color: var(--tt-gray-light-200);
  --tt-button-active-bg-color: var(--tt-gray-light-a-200);
  --tt-button-active-bg-color-emphasized: var(
    --tt-brand-color-100
  ); //more important active state
  --tt-button-active-bg-color-subdued: var(
    --tt-gray-light-a-200
  ); //less important active state
  --tt-button-active-hover-bg-color: var(--tt-gray-light-300);
  --tt-button-active-hover-bg-color-emphasized: var(
    --tt-brand-color-200
  ); //more important active state hover
  --tt-button-active-hover-bg-color-subdued: var(
    --tt-gray-light-a-300
  ); //less important active state hover
  --tt-button-disabled-bg-color: var(--tt-gray-light-a-50);

  /* Dark mode */
  .dark & {
    --tt-button-default-bg-color: var(--tt-gray-dark-a-100);
    --tt-button-hover-bg-color: var(--tt-gray-dark-200);
    --tt-button-active-bg-color: var(--tt-gray-dark-a-200);
    --tt-button-active-bg-color-emphasized: var(
      --tt-brand-color-900
    ); //more important active state
    --tt-button-active-bg-color-subdued: var(
      --tt-gray-dark-a-200
    ); //less important active state
    --tt-button-active-hover-bg-color: var(--tt-gray-dark-300);
    --tt-button-active-hover-bg-color-emphasized: var(
      --tt-brand-color-800
    ); //more important active state hover
    --tt-button-active-hover-bg-color-subdued: var(
      --tt-gray-dark-a-300
    ); //less important active state hover
    --tt-button-disabled-bg-color: var(--tt-gray-dark-a-50);
  }

  /**************************************************
      Default button text color
  **************************************************/

  /* Light mode */
  --tt-button-default-text-color: var(--tt-gray-light-a-600);
  --tt-button-hover-text-color: var(--tt-gray-light-a-900);
  --tt-button-active-text-color: var(--tt-gray-light-a-900);
  --tt-button-active-text-color-emphasized: var(--tt-gray-light-a-900);
  --tt-button-active-text-color-subdued: var(--tt-gray-light-a-900);
  --tt-button-disabled-text-color: var(--tt-gray-light-a-400);

  /* Dark mode */
  .dark & {
    --tt-button-default-text-color: var(--tt-gray-dark-a-600);
    --tt-button-hover-text-color: var(--tt-gray-dark-a-900);
    --tt-button-active-text-color: var(--tt-gray-dark-a-900);
    --tt-button-active-text-color-emphasized: var(--tt-gray-dark-a-900);
    --tt-button-active-text-color-subdued: var(--tt-gray-dark-a-900);
    --tt-button-disabled-text-color: var(--tt-gray-dark-a-300);
  }

  /**************************************************
      Default button icon color
  **************************************************/

  /* Light mode */
  --tt-button-default-icon-color: var(--tt-gray-light-a-600);
  --tt-button-hover-icon-color: var(--tt-gray-light-a-900);
  --tt-button-active-icon-color: var(--tt-brand-color-500);
  --tt-button-active-icon-color-emphasized: var(--tt-brand-color-600);
  --tt-button-active-icon-color-subdued: var(--tt-gray-light-a-900);
  --tt-button-disabled-icon-color: var(--tt-gray-light-a-400);

  /* Dark mode */
  .dark & {
    --tt-button-default-icon-color: var(--tt-gray-dark-a-600);
    --tt-button-hover-icon-color: var(--tt-gray-dark-a-900);
    --tt-button-active-icon-color: var(--tt-brand-color-400);
    --tt-button-active-icon-color-emphasized: var(--tt-brand-color-400);
    --tt-button-active-icon-color-subdued: var(--tt-gray-dark-a-900);
    --tt-button-disabled-icon-color: var(--tt-gray-dark-a-400);
  }

  /**************************************************
      Default button subicon color
  **************************************************/

  /* Light mode */
  --tt-button-default-icon-sub-color: var(--tt-gray-light-a-400);
  --tt-button-hover-icon-sub-color: var(--tt-gray-light-a-500);
  --tt-button-active-icon-sub-color: var(--tt-gray-light-a-400);
  --tt-button-active-icon-sub-color-emphasized: var(--tt-gray-light-a-500);
  --tt-button-active-icon-sub-color-subdued: var(--tt-gray-light-a-400);
  --tt-button-disabled-icon-sub-color: var(--tt-gray-light-a-100);

  /* Dark mode */
  .dark & {
    --tt-button-default-icon-sub-color: var(--tt-gray-dark-a-300);
    --tt-button-hover-icon-sub-color: var(--tt-gray-dark-a-400);
    --tt-button-active-icon-sub-color: var(--tt-gray-dark-a-300);
    --tt-button-active-icon-sub-color-emphasized: var(--tt-gray-dark-a-400);
    --tt-button-active-icon-sub-color-subdued: var(--tt-gray-dark-a-300);
    --tt-button-disabled-icon-sub-color: var(--tt-gray-dark-a-100);
  }

  /**************************************************
      Default button dropdown / arrows color
  **************************************************/

  /* Light mode */
  --tt-button-default-dropdown-arrows-color: var(--tt-gray-light-a-600);
  --tt-button-hover-dropdown-arrows-color: var(--tt-gray-light-a-700);
  --tt-button-active-dropdown-arrows-color: var(--tt-gray-light-a-600);
  --tt-button-active-dropdown-arrows-color-emphasized: var(
    --tt-gray-light-a-700
  );
  --tt-button-active-dropdown-arrows-color-subdued: var(--tt-gray-light-a-600);
  --tt-button-disabled-dropdown-arrows-color: var(--tt-gray-light-a-400);

  /* Dark mode */
  .dark & {
    --tt-button-default-dropdown-arrows-color: var(--tt-gray-dark-a-600);
    --tt-button-hover-dropdown-arrows-color: var(--tt-gray-dark-a-700);
    --tt-button-active-dropdown-arrows-color: var(--tt-gray-dark-a-600);
    --tt-button-active-dropdown-arrows-color-emphasized: var(
      --tt-gray-dark-a-700
    );
    --tt-button-active-dropdown-arrows-color-subdued: var(--tt-gray-dark-a-600);
    --tt-button-disabled-dropdown-arrows-color: var(--tt-gray-dark-a-400);
  }

  /* ----------------------------------------------------------------
      --------------------------- GHOST BUTTON --------------------------
      ---------------------------------------------------------------- */

  &[data-style="ghost"] {
    /**************************************************
        Ghost button background color
    **************************************************/

    /* Light mode */
    --tt-button-default-bg-color: var(--transparent);
    --tt-button-hover-bg-color: var(--tt-gray-light-200);
    --tt-button-active-bg-color: var(--tt-gray-light-a-100);
    --tt-button-active-bg-color-emphasized: var(
      --tt-brand-color-100
    ); //more important active state
    --tt-button-active-bg-color-subdued: var(
      --tt-gray-light-a-100
    ); //less important active state
    --tt-button-active-hover-bg-color: var(--tt-gray-light-200);
    --tt-button-active-hover-bg-color-emphasized: var(
      --tt-brand-color-200
    ); //more important active state hover
    --tt-button-active-hover-bg-color-subdued: var(
      --tt-gray-light-a-200
    ); //less important active state hover
    --tt-button-disabled-bg-color: var(--transparent);

    /* Dark mode */
    .dark & {
      --tt-button-default-bg-color: var(--transparent);
      --tt-button-hover-bg-color: var(--tt-gray-dark-200);
      --tt-button-active-bg-color: var(--tt-gray-dark-a-100);
      --tt-button-active-bg-color-emphasized: var(
        --tt-brand-color-900
      ); //more important active state
      --tt-button-active-bg-color-subdued: var(
        --tt-gray-dark-a-100
      ); //less important active state
      --tt-button-active-hover-bg-color: var(--tt-gray-dark-200);
      --tt-button-active-hover-bg-color-emphasized: var(
        --tt-brand-color-800
      ); //more important active state hover
      --tt-button-active-hover-bg-color-subdued: var(
        --tt-gray-dark-a-200
      ); //less important active state hover
      --tt-button-disabled-bg-color: var(--transparent);
    }

    /**************************************************
        Ghost button text color
    **************************************************/

    /* Light mode */
    --tt-button-default-text-color: var(--tt-gray-light-a-600);
    --tt-button-hover-text-color: var(--tt-gray-light-a-900);
    --tt-button-active-text-color: var(--tt-gray-light-a-900);
    --tt-button-active-text-color-emphasized: var(--tt-gray-light-a-900);
    --tt-button-active-text-color-subdued: var(--tt-gray-light-a-900);
    --tt-button-disabled-text-color: var(--tt-gray-light-a-400);

    /* Dark mode */
    .dark & {
      --tt-button-default-text-color: var(--tt-gray-dark-a-600);
      --tt-button-hover-text-color: var(--tt-gray-dark-a-900);
      --tt-button-active-text-color: var(--tt-gray-dark-a-900);
      --tt-button-active-text-color-emphasized: var(--tt-gray-dark-a-900);
      --tt-button-active-text-color-subdued: var(--tt-gray-dark-a-900);
      --tt-button-disabled-text-color: var(--tt-gray-dark-a-300);
    }

    /**************************************************
        Ghost button icon color
    **************************************************/

    /* Light mode */
    --tt-button-default-icon-color: var(--tt-gray-light-a-600);
    --tt-button-hover-icon-color: var(--tt-gray-light-a-900);
    --tt-button-active-icon-color: var(--tt-brand-color-500);
    --tt-button-active-icon-color-emphasized: var(--tt-brand-color-600);
    --tt-button-active-icon-color-subdued: var(--tt-gray-light-a-900);
    --tt-button-disabled-icon-color: var(--tt-gray-light-a-400);

    /* Dark mode */
    .dark & {
      --tt-button-default-icon-color: var(--tt-gray-dark-a-600);
      --tt-button-hover-icon-color: var(--tt-gray-dark-a-900);
      --tt-button-active-icon-color: var(--tt-brand-color-400);
      --tt-button-active-icon-color-emphasized: var(--tt-brand-color-300);
      --tt-button-active-icon-color-subdued: var(--tt-gray-dark-a-900);
      --tt-button-disabled-icon-color: var(--tt-gray-dark-a-400);
    }

    /**************************************************
        Ghost button subicon color
    **************************************************/

    /* Light mode */
    --tt-button-default-icon-sub-color: var(--tt-gray-light-a-400);
    --tt-button-hover-icon-sub-color: var(--tt-gray-light-a-500);
    --tt-button-active-icon-sub-color: var(--tt-gray-light-a-400);
    --tt-button-active-icon-sub-color-emphasized: var(--tt-gray-light-a-500);
    --tt-button-active-icon-sub-color-subdued: var(--tt-gray-light-a-400);
    --tt-button-disabled-icon-sub-color: var(--tt-gray-light-a-100);

    /* Dark mode */
    .dark & {
      --tt-button-default-icon-sub-color: var(--tt-gray-dark-a-300);
      --tt-button-hover-icon-sub-color: var(--tt-gray-dark-a-400);
      --tt-button-active-icon-sub-color: var(--tt-gray-dark-a-300);
      --tt-button-active-icon-sub-color-emphasized: var(--tt-gray-dark-a-400);
      --tt-button-active-icon-sub-color-subdued: var(--tt-gray-dark-a-300);
      --tt-button-disabled-icon-sub-color: var(--tt-gray-dark-a-100);
    }

    /**************************************************
        Ghost button dropdown / arrows color
    **************************************************/

    /* Light mode */
    --tt-button-default-dropdown-arrows-color: var(--tt-gray-light-a-600);
    --tt-button-hover-dropdown-arrows-color: var(--tt-gray-light-a-700);
    --tt-button-active-dropdown-arrows-color: var(--tt-gray-light-a-600);
    --tt-button-active-dropdown-arrows-color-emphasized: var(
      --tt-gray-light-a-700
    );
    --tt-button-active-dropdown-arrows-color-subdued: var(
      --tt-gray-light-a-600
    );
    --tt-button-disabled-dropdown-arrows-color: var(--tt-gray-light-a-400);

    /* Dark mode */
    .dark & {
      --tt-button-default-dropdown-arrows-color: var(--tt-gray-dark-a-600);
      --tt-button-hover-dropdown-arrows-color: var(--tt-gray-dark-a-700);
      --tt-button-active-dropdown-arrows-color: var(--tt-gray-dark-a-600);
      --tt-button-active-dropdown-arrows-color-emphasized: var(
        --tt-gray-dark-a-700
      );
      --tt-button-active-dropdown-arrows-color-subdued: var(
        --tt-gray-dark-a-600
      );
      --tt-button-disabled-dropdown-arrows-color: var(--tt-gray-dark-a-400);
    }
  }

  /* ----------------------------------------------------------------
      -------------------------- PRIMARY BUTTON -------------------------
      ---------------------------------------------------------------- */

  &[data-style="primary"] {
    /**************************************************
        Primary button background color
    **************************************************/

    /* Light mode */
    --tt-button-default-bg-color: var(--tt-brand-color-500);
    --tt-button-hover-bg-color: var(--tt-brand-color-600);
    --tt-button-active-bg-color: var(--tt-brand-color-100);
    --tt-button-active-bg-color-emphasized: var(
      --tt-brand-color-100
    ); //more important active state
    --tt-button-active-bg-color-subdued: var(
      --tt-brand-color-100
    ); //less important active state
    --tt-button-active-hover-bg-color: var(--tt-brand-color-200);
    --tt-button-active-hover-bg-color-emphasized: var(
      --tt-brand-color-200
    ); //more important active state hover
    --tt-button-active-hover-bg-color-subdued: var(
      --tt-brand-color-200
    ); //less important active state hover
    --tt-button-disabled-bg-color: var(--tt-gray-light-a-100);

    /* Dark mode */
    .dark & {
      --tt-button-default-bg-color: var(--tt-brand-color-500);
      --tt-button-hover-bg-color: var(--tt-brand-color-600);
      --tt-button-active-bg-color: var(--tt-brand-color-900);
      --tt-button-active-bg-color-emphasized: var(
        --tt-brand-color-900
      ); //more important active state
      --tt-button-active-bg-color-subdued: var(
        --tt-brand-color-900
      ); //less important active state
      --tt-button-active-hover-bg-color: var(--tt-brand-color-800);
      --tt-button-active-hover-bg-color-emphasized: var(
        --tt-brand-color-800
      ); //more important active state hover
      --tt-button-active-hover-bg-color-subdued: var(
        --tt-brand-color-800
      ); //less important active state hover
      --tt-button-disabled-bg-color: var(--tt-gray-dark-a-100);
    }

    /**************************************************
        Primary button text color
    **************************************************/

    /* Light mode */
    --tt-button-default-text-color: var(--white);
    --tt-button-hover-text-color: var(--white);
    --tt-button-active-text-color: var(--tt-gray-light-a-900);
    --tt-button-active-text-color-emphasized: var(--tt-gray-light-a-900);
    --tt-button-active-text-color-subdued: var(--tt-gray-light-a-900);
    --tt-button-disabled-text-color: var(--tt-gray-light-a-400);

    /* Dark mode */
    .dark & {
      --tt-button-default-text-color: var(--white);
      --tt-button-hover-text-color: var(--white);
      --tt-button-active-text-color: var(--tt-gray-dark-a-900);
      --tt-button-active-text-color-emphasized: var(--tt-gray-dark-a-900);
      --tt-button-active-text-color-subdued: var(--tt-gray-dark-a-900);
      --tt-button-disabled-text-color: var(--tt-gray-dark-a-300);
    }

    /**************************************************
        Primary button icon color
    **************************************************/

    /* Light mode */
    --tt-button-default-icon-color: var(--white);
    --tt-button-hover-icon-color: var(--white);
    --tt-button-active-icon-color: var(--tt-brand-color-600);
    --tt-button-active-icon-color-emphasized: var(--tt-brand-color-600);
    --tt-button-active-icon-color-subdued: var(--tt-brand-color-600);
    --tt-button-disabled-icon-color: var(--tt-gray-light-a-400);

    /* Dark mode */
    .dark & {
      --tt-button-default-icon-color: var(--white);
      --tt-button-hover-icon-color: var(--white);
      --tt-button-active-icon-color: var(--tt-brand-color-400);
      --tt-button-active-icon-color-emphasized: var(--tt-brand-color-400);
      --tt-button-active-icon-color-subdued: var(--tt-brand-color-400);
      --tt-button-disabled-icon-color: var(--tt-gray-dark-a-300);
    }

    /**************************************************
        Primary button subicon color
    **************************************************/

    /* Light mode */
    --tt-button-default-icon-sub-color: var(--tt-gray-dark-a-500);
    --tt-button-hover-icon-sub-color: var(--tt-gray-dark-a-500);
    --tt-button-active-icon-sub-color: var(--tt-gray-light-a-500);
    --tt-button-active-icon-sub-color-emphasized: var(--tt-gray-light-a-500);
    --tt-button-active-icon-sub-color-subdued: var(--tt-gray-light-a-500);
    --tt-button-disabled-icon-sub-color: var(--tt-gray-light-a-100);

    /* Dark mode */
    .dark & {
      --tt-button-default-icon-sub-color: var(--tt-gray-dark-a-400);
      --tt-button-hover-icon-sub-color: var(--tt-gray-dark-a-500);
      --tt-button-active-icon-sub-color: var(--tt-gray-dark-a-300);
      --tt-button-active-icon-sub-color-emphasized: var(--tt-gray-dark-a-400);
      --tt-button-active-icon-sub-color-subdued: var(--tt-gray-dark-a-300);
      --tt-button-disabled-icon-sub-color: var(--tt-gray-dark-a-100);
    }

    /**************************************************
        Primary button dropdown / arrows color
    **************************************************/

    /* Light mode */
    --tt-button-default-dropdown-arrows-color: var(--white);
    --tt-button-hover-dropdown-arrows-color: var(--white);
    --tt-button-active-dropdown-arrows-color: var(--tt-gray-light-a-700);
    --tt-button-active-dropdown-arrows-color-emphasized: var(
      --tt-gray-light-a-700
    );
    --tt-button-active-dropdown-arrows-color-subdued: var(
      --tt-gray-light-a-700
    );
    --tt-button-disabled-dropdown-arrows-color: var(--tt-gray-light-a-400);

    /* Dark mode */
    .dark & {
      --tt-button-default-dropdown-arrows-color: var(--white);
      --tt-button-hover-dropdown-arrows-color: var(--white);
      --tt-button-active-dropdown-arrows-color: var(--tt-gray-dark-a-600);
      --tt-button-active-dropdown-arrows-color-emphasized: var(
        --tt-gray-dark-a-600
      );
      --tt-button-active-dropdown-arrows-color-subdued: var(
        --tt-gray-dark-a-600
      );
      --tt-button-disabled-dropdown-arrows-color: var(--tt-gray-dark-a-400);
    }
  }

  font-size: 0.875rem;
  font-weight: 500;
  font-feature-settings:
    "salt" on,
    "cv01" on;
  line-height: 1.15;
  height: 2rem;
  min-width: 2rem;
  border: none;
  padding: 0.5rem;
  gap: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--tt-radius-lg, 0.75rem);
  transition-property: background, color, opacity;
  transition-duration: var(--tt-transition-duration-default);
  transition-timing-function: var(--tt-transition-easing-default);

  // focus-visible
  &:focus-visible {
    outline: none;
  }

  &[data-highlighted="true"],
  &[data-focus-visible="true"] {
    background-color: var(--tt-button-hover-bg-color);
    color: var(--tt-button-hover-text-color);
    // outline: 2px solid var(--tt-button-active-icon-color);
  }

  &[data-weight="small"] {
    width: 1.5rem;
    min-width: 1.5rem;
    padding-right: 0;
    padding-left: 0;
  }

  /* button size large */
  &[data-size="large"] {
    font-size: 0.9375rem;
    height: 2.375rem;
    min-width: 2.375rem;
    padding: 0.625rem;
  }

  /* button size small */
  &[data-size="small"] {
    font-size: 0.75rem;
    line-height: 1.2;
    height: 1.5rem;
    min-width: 1.5rem;
    padding: 0.3125rem;
    border-radius: var(--tt-radius-md, 0.5rem);
  }

  /* trim / expand text of the button */
  .tiptap-button-text {
    padding: 0 0.125rem;
    flex-grow: 1;
    text-align: left;
    line-height: 1.5rem;
  }

  &[data-text-trim="on"] {
    .tiptap-button-text {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  /* global icon settings */
  .tiptap-button-icon,
  .tiptap-button-icon-sub,
  .tiptap-button-dropdown-arrows,
  .tiptap-button-dropdown-small {
    flex-shrink: 0;
  }

  /* standard icon, what is used */
  .tiptap-button-icon {
    width: 1rem;
    height: 1rem;
  }

  &[data-size="large"] .tiptap-button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  &[data-size="small"] .tiptap-button-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* if 2 icons are used and this icon should be more subtle */
  .tiptap-button-icon-sub {
    width: 1rem;
    height: 1rem;
  }

  &[data-size="large"] .tiptap-button-icon-sub {
    width: 1.125rem;
    height: 1.125rem;
  }

  &[data-size="small"] .tiptap-button-icon-sub {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* dropdown menus or arrows that are slightly smaller */
  .tiptap-button-dropdown-arrows {
    width: 0.75rem;
    height: 0.75rem;
  }

  &[data-size="large"] .tiptap-button-dropdown-arrows {
    width: 0.875rem;
    height: 0.875rem;
  }

  &[data-size="small"] .tiptap-button-dropdown-arrows {
    width: 0.625rem;
    height: 0.625rem;
  }

  /* dropdown menu for icon buttons only */
  .tiptap-button-dropdown-small {
    width: 0.625rem;
    height: 0.625rem;
  }

  &[data-size="large"] .tiptap-button-dropdown-small {
    width: 0.75rem;
    height: 0.75rem;
  }

  &[data-size="small"] .tiptap-button-dropdown-small {
    width: 0.5rem;
    height: 0.5rem;
  }

  /* button only has icons */
  &:has(> svg):not(:has(> :not(svg))) {
    gap: 0.125rem;

    &[data-size="large"],
    &[data-size="small"] {
      gap: 0.125rem;
    }
  }

  /* button only has 2 icons and one of them is dropdown small */
  &:has(> svg:nth-of-type(2)):has(> .tiptap-button-dropdown-small):not(
      :has(> svg:nth-of-type(3))
    ):not(:has(> .tiptap-button-text)) {
    gap: 0;
    padding-right: 0.25rem;

    &[data-size="large"] {
      padding-right: 0.375rem;
    }

    &[data-size="small"] {
      padding-right: 0.25rem;
    }
  }

  /* Emoji is used in a button */
  .tiptap-button-emoji {
    width: 1rem;
    display: flex;
    justify-content: center;
  }

  &[data-size="large"] .tiptap-button-emoji {
    width: 1.125rem;
  }

  &[data-size="small"] .tiptap-button-emoji {
    width: 0.875rem;
  }

  /* --------------------------------------------
  ----------- BUTTON COLOR SETTINGS -------------
  -------------------------------------------- */

  background-color: var(--tt-button-default-bg-color);
  color: var(--tt-button-default-text-color);

  .tiptap-button-icon {
    color: var(--tt-button-default-icon-color);
  }

  .tiptap-button-icon-sub {
    color: var(--tt-button-default-icon-sub-color);
  }

  .tiptap-button-dropdown-arrows {
    color: var(--tt-button-default-dropdown-arrows-color);
  }

  .tiptap-button-dropdown-small {
    color: var(--tt-button-default-dropdown-arrows-color);
  }

  /* hover state of a button */
  &:hover:not([data-active-item="true"]):not([disabled]),
  &[data-active-item="true"]:not([disabled]),
  &[data-highlighted]:not([disabled]):not([data-highlighted="false"]) {
    background-color: var(--tt-button-hover-bg-color);
    color: var(--tt-button-hover-text-color);

    .tiptap-button-icon {
      color: var(--tt-button-hover-icon-color);
    }

    .tiptap-button-icon-sub {
      color: var(--tt-button-hover-icon-sub-color);
    }

    .tiptap-button-dropdown-arrows,
    .tiptap-button-dropdown-small {
      color: var(--tt-button-hover-dropdown-arrows-color);
    }
  }

  /* Active state of a button */
  &[data-active-state="on"]:not([disabled]),
  &[data-state="open"]:not([disabled]) {
    background-color: var(--tt-button-active-bg-color);
    color: var(--tt-button-active-text-color);

    .tiptap-button-icon {
      color: var(--tt-button-active-icon-color);
    }

    .tiptap-button-icon-sub {
      color: var(--tt-button-active-icon-sub-color);
    }

    .tiptap-button-dropdown-arrows,
    .tiptap-button-dropdown-small {
      color: var(--tt-button-active-dropdown-arrows-color);
    }

    &:hover {
      background-color: var(--tt-button-active-hover-bg-color);
    }

    /* Emphasized */
    &[data-appearance="emphasized"] {
      background-color: var(--tt-button-active-bg-color-emphasized);
      color: var(--tt-button-active-text-color-emphasized);

      .tiptap-button-icon {
        color: var(--tt-button-active-icon-color-emphasized);
      }

      .tiptap-button-icon-sub {
        color: var(--tt-button-active-icon-sub-color-emphasized);
      }

      .tiptap-button-dropdown-arrows,
      .tiptap-button-dropdown-small {
        color: var(--tt-button-active-dropdown-arrows-color-emphasized);
      }

      &:hover {
        background-color: var(--tt-button-active-hover-bg-color-emphasized);
      }
    }

    /* Subdued */
    &[data-appearance="subdued"] {
      background-color: var(--tt-button-active-bg-color-subdued);
      color: var(--tt-button-active-text-color-subdued);

      .tiptap-button-icon {
        color: var(--tt-button-active-icon-color-subdued);
      }

      .tiptap-button-icon-sub {
        color: var(--tt-button-active-icon-sub-color-subdued);
      }

      .tiptap-button-dropdown-arrows,
      .tiptap-button-dropdown-small {
        color: var(--tt-button-active-dropdown-arrows-color-subdued);
      }

      &:hover {
        background-color: var(--tt-button-active-hover-bg-color-subdued);

        .tiptap-button-icon {
          color: var(--tt-button-active-icon-color-subdued);
        }
      }
    }
  }

  &:disabled {
    background-color: var(--tt-button-disabled-bg-color);
    color: var(--tt-button-disabled-text-color);

    .tiptap-button-icon {
      color: var(--tt-button-disabled-icon-color);
    }
  }
`;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </React.Fragment>
      ))}
    </div>
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const shortcuts = React.useMemo(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys]
    )

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={cn("tiptap-button", className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={cn("tiptap-button", className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </TooltipContent>
      </Tooltip>
    )
  }
)

export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, children, orientation = "vertical", popover, ...props }, ref) => {
  return (
    <StyledButtonGroup
      ref={ref}
      className={className}
      data-orientation={orientation}
      role="group"
      {...props}
    >
      {children}
    </StyledButtonGroup>
  )
})
