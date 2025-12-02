import styled from 'styled-components';

export const PaneContentContainer = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: 40px auto;
  overflow: hidden;
`;

export const PaneContent = styled.div`
  position: relative;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-left: 16px;
  padding-right: 16px;
`;
