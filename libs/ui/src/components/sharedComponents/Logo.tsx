import styled from 'styled-components';

const LogoWrapper = styled.a`
  font-size: 1.1rem;
  color: var(--ion-text-color, #000000);
  text-decoration: none;
`;

export const Logo: React.FC = () => {
  return <LogoWrapper href="https://feynote.com">FeyNote</LogoWrapper>;
};
