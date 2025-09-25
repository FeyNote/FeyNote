import { Button, Dialog, Flex, type ButtonProps } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const StyledDialogTitle = styled(Dialog.Title)`
  margin-top: 0;
`;

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actionButtons?: {
    title: string;
    props: ButtonProps;
  }[];
}

/**
 * A simple dialogue that prompts the user with a few options and a message.
 */
export const ActionDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Content maxWidth="350px">
        <StyledDialogTitle>{props.title}</StyledDialogTitle>
        {props.description && (
          <Dialog.Description size="2" mb="4">
            {props.description}
            <br />
          </Dialog.Description>
        )}
        {props.children}
        <Flex gap="3" mt="4" justify="end">
          {props.actionButtons?.map((el, idx) => (
            <Dialog.Close key={idx}>
              <Button {...el.props}>{el.title}</Button>
            </Dialog.Close>
          ))}
          {!props.actionButtons?.length && (
            <Dialog.Close>
              <Button>{t('generic.okay')}</Button>
            </Dialog.Close>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
