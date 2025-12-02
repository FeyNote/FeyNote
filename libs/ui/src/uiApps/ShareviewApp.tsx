import { sharedAppInit } from './sharedAppInit';

import { ArtifactShareView } from '../components/sharing/ArtifactShareView';
import {
  PaneableComponent,
  PaneableComponentProps,
} from '../context/globalPane/PaneableComponent';
import { GlobalContextContainer } from '../context/GlobalContextContainer';

sharedAppInit();

interface Props {
  id: string;
}
export const ShareviewApp: React.FC<Props> = (props) => {
  return (
    <GlobalContextContainer
      singlePaneMode={{
        navigationEventId: 'shareview',
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
      <ArtifactShareView artifactId={props.id} />
    </GlobalContextContainer>
  );
};
