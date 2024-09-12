import { Logo } from './Logo';
import styled from 'styled-components';

const Container = styled.div`
  height: 100px;
  padding-left: 20px;
  padding-top: 20px;
  display: flex;
`;

interface Props {
  children?: React.ReactNode;
}

export const LogoActionContainer: React.FC<Props> = (props) => {
  return (
    <Container>
      <Logo />
      {props.children}
    </Container>
  );
};
