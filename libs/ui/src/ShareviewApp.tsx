import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.class.css';
import './css/global.css';
import { initI18Next } from './i18n/initI18Next';
import { PreferencesContextProviderWrapper } from './context/preferences/PreferencesContextProviderWrapper';
import { ArtifactShareView } from './components/sharing/sharedArtifactByToken/ArtifactShareView';
import { useMemo } from 'react';
import { PaneContext, PaneContextData } from './context/pane/PaneContext';
import {
  PaneableComponent,
  PaneableComponentProps,
} from './context/globalPane/PaneableComponent';

initI18Next();
setupIonicReact();

interface Props {
  id: string;
}
export const ShareviewApp: React.FC<Props> = (props) => {
  const shareToken =
    new URLSearchParams(window.location.search).get('shareToken') || undefined;

  const paneContextValue = useMemo<PaneContextData>(
    () => ({
      navigateHistoryBack: () => undefined, // Noop
      navigateHistoryForward: () => undefined, // Noop
      navigate: (componentName, componentProps, transition, select) => {
        if (componentName === PaneableComponent.Artifact) {
          const id = (componentProps as PaneableComponentProps['Artifact']).id;

          const url = new URL(`/artifact/${id}`, window.location.href);
          // TODO: the following will absolutely not work with the current shareToken implementation
          // but this is an idea of what we'd do once we can share sets of artifacts under the same token
          if (shareToken) url.searchParams.set('shareToken', shareToken);

          window.location.href = url.href;
        } else {
          // Noop
        }
      },
      renamePane: (name: string) => undefined, // Noop
      pane: {
        id: props.id,
        history: [],
        forwardHistory: [],
        currentView: {
          component: PaneableComponent.Artifact,
          navigationEventId: 'shareview',
          props: {
            id: props.id,
          },
        },
      },
      isPaneFocused: true,
    }),
    [props.id],
  );

  return (
    <IonApp>
      <PreferencesContextProviderWrapper>
        <PaneContext.Provider value={paneContextValue}>
          <ArtifactShareView artifactId={props.id} shareToken={shareToken} />
        </PaneContext.Provider>
      </PreferencesContextProviderWrapper>
    </IonApp>
  );
};
