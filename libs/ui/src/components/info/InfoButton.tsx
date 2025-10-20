import { Tooltip } from '@radix-ui/themes';
import { IoInformation } from 'react-icons/io5';
import styled from 'styled-components';

const Container = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconBackdrop = styled.div`
  background: var(--ion-color-primary-shade);
  color: white;
  border-radius: 100%;
  height: 12px;
  width: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Props {
  slot?: string;
  message: string;
}

export const InfoButton = (props: Props) => {
  // React applies the slot property even if you pass slot={undefined} :|
  const slotProps = props.slot ? { slot: props.slot } : {};

  return (
    <Container {...slotProps}>
      <Tooltip content={props.message}>
        <IconBackdrop>
          <IoInformation size="10" />
        </IconBackdrop>
      </Tooltip>
    </Container>
  );
};
