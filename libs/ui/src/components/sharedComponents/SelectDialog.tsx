import { Flex } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from './Checkbox';
import styled from 'styled-components';
import { ActionDialog } from './ActionDialog';

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
    <ActionDialog
      title={props.title}
      description={props.subtitle}
      open={open}
      onOpenChange={(newOpen) => setOpen(newOpen)}
      triggerChildren={props.children}
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
            onClick: (e) => {
              e.stopPropagation();
              props.onChange([...props.selectedValues]);
            },
          },
        },
        {
          title: t('generic.okay'),
          props: {
            onClick: (e) => {
              e.stopPropagation();
              props.onChange([...selectedValues]);
            },
          },
        },
      ]}
    >
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
    </ActionDialog>
  );
};
