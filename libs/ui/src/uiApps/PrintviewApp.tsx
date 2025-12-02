import '../css/printView.css';
import { sharedAppInit } from './sharedAppInit';

import { useRef } from 'react';
import {
  PaneableComponent,
  type PaneableComponentProps,
} from '../context/globalPane/PaneableComponent';
import { ReadonlyArtifactViewer } from '../components/artifact/ReadonlySimpleArtifact';
import { GlobalContextContainer } from '../context/GlobalContextContainer';

sharedAppInit();

interface Props {
  id: string;
}
export const PrintviewApp: React.FC<Props> = (props) => {
  const autoPrintTriggeredRef = useRef(false);

  const onReady = () => {
    const autoPrint =
      new URLSearchParams(window.location.search).get('autoPrint') || undefined;

    if (autoPrint && !autoPrintTriggeredRef.current) {
      autoPrintTriggeredRef.current = true;
      window.print();
      window.close();
    }
  };

  return (
    <GlobalContextContainer
      singlePaneMode={{
        navigationEventId: 'printview',
        onNavigate: (component, props) => {
          if (component === PaneableComponent.Artifact) {
            const id = (props as PaneableComponentProps['Artifact']).id;

            const url = new URL(`/artifact/${id}`, window.location.href);

            window.location.href = url.href;
          } else {
            // Noop
          }
        },
      }}
    >
      <ReadonlyArtifactViewer artifactId={props.id} onReady={onReady} />
    </GlobalContextContainer>
  );
};
