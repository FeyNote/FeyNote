import { Button, Dialog, Flex } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from './Checkbox';
import styled from 'styled-components';

const StyledDialogTitle = styled(Dialog.Title)`
  margin-top: 0;
`;

const StyledClickableFlexItem = styled(Flex)`
  cursor: pointer;
  user-select: none;
`;

interface Props {
  onChange: (value: Array<string>) => void;
  title: string;
  subtitle?: string;
  selectedValues: ReadonlyArray<string>;
  allowMultiple: boolean;
  options: {
    value: string;
    title: string;
  }[];
  children: React.ReactNode;
}

export const SelectDialog = (props: Props) => {
  const { t } = useTranslation();
  const [selectedValues, setSelectedValues] = useState(
    () => new Set(props.selectedValues),
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedValues(new Set(props.selectedValues));
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(newOpen) => setOpen(newOpen)}>
      <Dialog.Trigger>{props.children}</Dialog.Trigger>

      <Dialog.Content maxWidth="300px">
        <StyledDialogTitle>{props.title}</StyledDialogTitle>
        {props.subtitle && (
          <Dialog.Description size="2" mb="4">
            {props.subtitle}
          </Dialog.Description>
        )}

        {props.options.map((el) => (
          <StyledClickableFlexItem
            gap="2"
            align="center"
            key={el.value}
            onClick={() => {
              if (props.allowMultiple) {
                const editableSet = new Set(selectedValues);
                if (selectedValues.has(el.value)) {
                  editableSet.delete(el.value);
                } else {
                  editableSet.add(el.value);
                }
                setSelectedValues(editableSet);
              } else {
                setSelectedValues(new Set([el.value]));
              }
            }}
          >
            <Checkbox checked={selectedValues.has(el.value)} size="medium" />
            {el.title}
          </StyledClickableFlexItem>
        ))}

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button
              variant="soft"
              color="gray"
              onClick={() => props.onChange([...props.selectedValues])}
            >
              {t('generic.cancel')}
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={() => props.onChange([...selectedValues])}>
              {t('generic.okay')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
