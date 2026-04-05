import styled from 'styled-components';

export const ArtifactEditorContainer = styled.div`
  contain: unset;
  overflow: visible;
  background: var(--card-background);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-box-shadow);

  margin-left: 0;
  margin-right: 0;
  margin-top: 3px; // We need this to prevent the card shadow from being clipped by the nav

  @media print {
    box-shadow: none;
  }
`;
