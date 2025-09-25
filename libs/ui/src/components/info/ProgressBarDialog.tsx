import { Dialog, Flex } from '@radix-ui/themes';
import type { FC } from 'react';
import { ProgressBar } from './ProgressBar';

interface Props {
  title?: string;
  message?: string;
  progress: number; // 0-1
  actions?: React.ReactNode;
}

export const ProgressBarDialog: FC<Props> = (props) => {
  return (
    <Dialog.Root open={true}>
      <Dialog.Content maxWidth="350px">
        {props.title && <Dialog.Title>{props.title}</Dialog.Title>}
        {props.message && (
          <Dialog.Description>{props.message}</Dialog.Description>
        )}
        <ProgressBar progress={props.progress} barStyle="thick" />
        <Flex justify="end">{props.actions}</Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
