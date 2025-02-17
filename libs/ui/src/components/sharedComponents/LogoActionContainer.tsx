import { Logo } from './Logo';
import styled from 'styled-components';

const Container = styled.div`
  height: 100px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

interface Props {
  children?: React.ReactNode;
}

export const LogoActionContainer: React.FC<Props> = (props) => {
  return (
    <Container>
      <Row>
        <Logo />
        {props.children}
      </Row>
    </Container>
  );
};
