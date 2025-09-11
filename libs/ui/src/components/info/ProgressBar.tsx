import { Progress } from 'radix-ui';
import type { FC } from 'react';
import styled from 'styled-components';

const ProgressRoot = styled(Progress.Root)<{
  $barStyle: 'thick' | 'thin';
}>`
  position: relative;
  overflow: hidden;
  background: var(--ion-background-color-step-100);
  border-radius: 10px;
  height: ${(props) => (props.$barStyle === 'thick' ? '4px' : '2px')};
  width: 100%;

  /* Fix overflow clipping in Safari */
  /* https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0 */
  transform: translateZ(0);
`;

const ProgressIndicator = styled(Progress.Indicator)`
  background-color: var(--ion-text-color);
  width: 100%;
  height: 100%;
  transition: transform 250ms cubic-bezier(0.65, 0, 0.35, 1);
`;

interface Props {
  progress: number; // 0-1
  barStyle?: 'thin' | 'thick';
}

export const ProgressBar: FC<Props> = (props) => {
  const progressPercent = props.progress * 100;
  const barStyle = props.barStyle || 'thick';

  return (
    <ProgressRoot value={progressPercent} $barStyle={barStyle}>
      <ProgressIndicator
        style={{
          transform:
            progressPercent < 100
              ? `translateX(-${100 - progressPercent}%)`
              : undefined,
        }}
      />
    </ProgressRoot>
  );
};
