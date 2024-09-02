import styled from 'styled-components';
import { useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const Container = styled.div<{
  $top?: number;
  $left?: number;
  $right?: number;
  $bottom?: number;
  $pointer?: boolean;
  $width: number;
  $minHeight: number;
  $maxHeight: number;
}>`
  position: absolute;
  ${(props) => props.$top !== undefined && `top: ${props.$top}px;`}
  ${(props) => props.$left !== undefined && `left: ${props.$left}px;`}
  ${(props) => props.$right !== undefined && `right: ${props.$right}px;`}
  ${(props) => props.$bottom !== undefined && `top: ${props.$bottom}px;`}
  ${(props) => props.$bottom !== undefined && `transform: translateY(-100%);`}
  ${(props) => props.$pointer && `cursor: pointer;`}
  z-index: 100;
  width: min(${(props) => props.$width}px, 100%);
  min-height: ${(props) => props.$minHeight}px;
  max-height: ${(props) => props.$maxHeight}px;
`;

interface Props {
  className?: string;
  floatTarget: HTMLElement;
  children: ReactNode;
  width: number;
  minHeight: number;
  maxHeight: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const BoundedFloatingWindow: React.FC<Props> = (props) => {
  const bounds = useMemo(() => {
    const previewTargetBoundingRect = props.floatTarget.getBoundingClientRect();
    const bounds = {} as {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };

    if (
      previewTargetBoundingRect.top +
        previewTargetBoundingRect.height +
        props.maxHeight <
      window.innerHeight
    ) {
      bounds.top =
        previewTargetBoundingRect.top + previewTargetBoundingRect.height;
    } else {
      bounds.bottom = previewTargetBoundingRect.top;
    }
    if (previewTargetBoundingRect.left + props.width < window.innerWidth) {
      bounds.left = previewTargetBoundingRect.left;
    } else {
      bounds.right = 0;
    }
    return bounds;
  }, [props.floatTarget]);

  const referencePreviewContainer = document.getElementById(
    'referencePreviewContainer',
  );
  if (!referencePreviewContainer)
    throw new Error('referencePreviewContainer not defined in index.html!');

  // We portal because styling does not play well with editor instances inside of each other
  return createPortal(
    <Container
      className={props.className}
      $top={bounds.top}
      $left={bounds.left}
      $bottom={bounds.bottom}
      $right={bounds.right}
      $pointer={!!props.onClick}
      $width={props.width}
      $minHeight={props.minHeight}
      $maxHeight={props.maxHeight}
      onClick={(event) => props.onClick?.(event)}
    >
      {props.children}
    </Container>,
    referencePreviewContainer,
  );
};
