import { useEffect, useReducer } from 'react';
import styled from 'styled-components';
import { ProgressBar } from '../components/info/ProgressBar';

const ProgressBarPlaceholder = styled.div<{
  $barStyle: 'thick' | 'thin';
}>`
  height: ${(props) => (props.$barStyle === 'thick' ? '4px' : '2px')};
`;

export const useIndeterminateProgressBar = (opts?: {
  barStyle?: 'thin' | 'thick';
}) => {
  const [progress, updateProgress] = useReducer(
    (
      progress: number,
      action: 'increment' | 'reset' | 'start' | 'complete',
    ) => {
      if (action === 'start') {
        progress = 0.01;
      }

      if (action === 'increment' && progress > 0 && progress < 0.98) {
        const progressPercent = progress * 100;
        const incBy = Math.exp(-progressPercent / 20);
        progress += Math.min(incBy, 0.05);
      }

      if (action === 'complete' && progress !== 0) {
        progress = 1;
      }

      if (action === 'reset') {
        progress = 0;
      }

      return progress;
    },
    0,
  );

  console.log(progress);

  const _ProgressBar = progress ? (
    <ProgressBar
      barStyle={opts?.barStyle || 'thin'}
      progress={progress}
    ></ProgressBar>
  ) : (
    <ProgressBarPlaceholder
      $barStyle={opts?.barStyle || 'thin'}
    ></ProgressBarPlaceholder>
  );

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;

    if (progress !== 0) {
      progressInterval = setInterval(() => {
        updateProgress('increment');
      }, 100);
    }

    return () => {
      clearInterval(progressInterval);
    };
  }, [progress]);

  const complete = () => {
    updateProgress('complete');
    setTimeout(() => {
      updateProgress('reset');
    }, 250);
  };

  const startProgressBar = (autoTimeout = 5000) => {
    const timeout = setTimeout(() => {
      complete();
    }, autoTimeout);

    updateProgress('start');

    return {
      dismiss: () => {
        clearTimeout(timeout);
        complete();
      },
    };
  };

  return {
    ProgressBar: _ProgressBar,
    startProgressBar,
  };
};
