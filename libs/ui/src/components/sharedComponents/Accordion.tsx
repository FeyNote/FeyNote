import styled from 'styled-components';
import { Accordion as RadixAccordion } from '@radix-ui/themes';

const StyledAccordionRoot = styled(RadixAccordion.Root)``;
const StyledAccordionItem = styled(RadixAccordion.Item)`
  display: flex;
  flex: 1 1 0%;
  flex-direction: inherit;
  align-items: inherit;
  align-self: stretch;
  text-overflow: ellipsis;
`;
const StyledAccordionTrigger = styled(RadixAccordion.Trigger)`
  padding: 8px;
`;
const StyledAccordionHeader = styled(RadixAccordion.Header)``;
const StyledAccordionContent = styled(RadixAccordion.Content)``;

interface Props {
  type: 'multiple' | 'single';
  items: {
    title: string;
    content: React.ReactNode;
    header?: string;
    disabled?: boolean;
  }[];
}

export const Accordion = (props: Props) => {
  return (
    <StyledAccordionRoot type={props.type}>
      {props.items.map((item, i) => {
        return (
          <StyledAccordionItem
            disabled={!!item.disabled}
            value={`${item.title}-${i}`}
          >
            <StyledAccordionTrigger>{item.title}</StyledAccordionTrigger>
            {item.header && (
              <StyledAccordionHeader>{item.header}</StyledAccordionHeader>
            )}
            <StyledAccordionContent>{item.content}</StyledAccordionContent>
          </StyledAccordionItem>
        );
      })}
    </StyledAccordionRoot>
  );
};
