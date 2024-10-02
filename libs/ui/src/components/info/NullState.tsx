import { IonIcon } from '@ionic/react';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
`;

const Header = styled.h2<{
  $size: 'small' | 'large';
}>`
  font-size: ${(props) => (props.$size === 'large' ? '1.5rem' : '1.1rem')};
  margin-top: 8px;
  margin-bottom: 8px;
`;

interface Props {
  size?: 'small' | 'large';
  icon?: string;
  title: string;
  message?: string;
  className?: string;
}

export const NullState = (props: Props) => {
  const size = props.size || 'large';

  return (
    <Container className={props.className}>
      {!!props.icon && (
        <IonIcon
          icon={props.icon}
          size={size === 'large' ? 'large' : undefined}
        />
      )}
      <br />
      <div>
        <Header $size={size}>{props.title}</Header>
        {props.message && <span>{props.message}</span>}
      </div>
    </Container>
  );
};
