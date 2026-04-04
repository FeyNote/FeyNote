import { ReadonlyArtifactViewer } from '../artifact/ReadonlySimpleArtifact';
import styled from 'styled-components';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { RiPrinterLine } from '../AppIcons';
import { IconButton } from '@radix-ui/themes';

const Container = styled.div`
  min-height: 100vh;
`;

const FloatingPresentation = styled.div`
  width: min(max(500px, 75%), 100%);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 100px;
  padding: 8px;
`;

const PrintButtonContainer = styled.div`
  margin-left: auto;
`;

interface Props {
  artifactId: string;
}

export const ArtifactShareView: React.FC<Props> = (props) => {
  return (
    <Container>
      <LogoActionContainer>
        <PrintButtonContainer>
          <IconButton
            variant="ghost"
            color="gray"
            size="2"
            onClick={() => {
              window.open(`/artifact/print/${props.artifactId}`);
            }}
          >
            <RiPrinterLine />
          </IconButton>
        </PrintButtonContainer>
      </LogoActionContainer>
      <FloatingPresentation>
        <ReadonlyArtifactViewer artifactId={props.artifactId} />
      </FloatingPresentation>
    </Container>
  );
};
