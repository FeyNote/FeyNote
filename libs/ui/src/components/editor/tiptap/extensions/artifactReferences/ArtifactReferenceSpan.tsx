import styled from 'styled-components';

export const ArtifactReferenceSpan = styled.span<{
  $isBroken: boolean;
}>`
  a {
    text-decoration: underline;
    color: inherit;
  }
`;
