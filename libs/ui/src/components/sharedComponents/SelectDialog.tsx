import { Button, Flex } from '@radix-ui/themes';
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
  quickActions?: {
    title: string;
    onClick: (
      options: ReadonlyArray<{ value: string; title: string }>,
      setSelectedValues: (values: Set<string>) => void,
    ) => void;
  }[];
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
      {props.allowMultiple && (
        <Flex gap="3" mt="3" justify="start" wrap="wrap">
          <Button
            variant="soft"
            size="1"
            color="gray"
            onClick={() =>
              setSelectedValues(new Set(props.options.map((o) => o.value)))
            }
          >
            {t('generic.selectAll')}
          </Button>
          <Button
            variant="soft"
            size="1"
            color="gray"
            onClick={() => setSelectedValues(new Set())}
          >
            {t('generic.deselectAll')}
          </Button>
          {props.quickActions?.map((action, idx) => (
            <Button
              key={idx}
              variant="soft"
              size="1"
              color="gray"
              onClick={() => action.onClick(props.options, setSelectedValues)}
            >
              {action.title}
            </Button>
          ))}
        </Flex>
      )}
    </ActionDialog>
  );
};
