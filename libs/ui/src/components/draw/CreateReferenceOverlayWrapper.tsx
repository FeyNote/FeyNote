import { Editor, useEditor } from 'tldraw';
import { CreateReferenceOverlay } from './CreateReferenceOverlay';
import {
  CustomTLDrawEventType,
  tldrawToolEventDriver,
} from './tldrawToolEventDriver';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
`;

export const CreateReferenceOverlayWrapper: React.FC = () => {
  const editor = useEditor();

  const [show, setShow] = useState(false);
  const [currentPagePoint, setCurrentPagePoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const listener = () => {
      const { currentPagePoint } = editor.inputs;

      setCurrentPagePoint(currentPagePoint);
      setShow(true);
    };

    tldrawToolEventDriver.addEventListener(
      CustomTLDrawEventType.ReferencePointerDown,
      listener,
    );
    return () => {
      tldrawToolEventDriver.removeEventListener(
        CustomTLDrawEventType.ReferencePointerDown,
        listener,
      );
    };
  }, []);

  return show ? (
    <Container>
      <CreateReferenceOverlay
        hide={() => setShow(false)}
        onSelected={(
          artifactId,
          artifactBlockId,
          artifactDate,
          referenceText,
        ) => {
          editor.createShape({
            type: 'reference',
            x: currentPagePoint.x,
            y: currentPagePoint.y,
            props: {
              targetArtifactId: artifactId,
              targetArtifactBlockId: artifactBlockId || null,
              targetArtifactDate: artifactDate || null,
              referenceText: referenceText,
            },
          });
          setShow(false);
        }}
      />
    </Container>
  ) : null;
};
