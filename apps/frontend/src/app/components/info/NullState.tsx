import { IonIcon } from '@ionic/react';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const Header = styled.h2`
  font-size: 1.5rem;
  margin-top: 8px;
  margin-bottom: 8px;
`;

interface Props {
  icon: string;
  title: string;
  message: string;
}

export const NullState = (props: Props) => {
  return (
    <Container>
      <IonIcon icon={props.icon} size="large" />
      <br />
      <div>
        <Header>{props.title}</Header>
        <span>{props.message}</span>
      </div>
    </Container>
  );
};
