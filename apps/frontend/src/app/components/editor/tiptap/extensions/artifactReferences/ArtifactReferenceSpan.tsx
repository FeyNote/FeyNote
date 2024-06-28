import styled from 'styled-components';

export const ArtifactReferenceSpan = styled.span<{
  $isBroken: boolean;
}>`
  background: ${(props) =>
    props.$isBroken ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
`;
