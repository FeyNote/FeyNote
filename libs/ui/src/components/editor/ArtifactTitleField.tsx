import styled from 'styled-components';

export const ArtifactTitleField = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 500;
  padding: 0;

  &::placeholder {
    color: var(--medium-color);
  }

  &:disabled {
    opacity: 1;
  }
`;
