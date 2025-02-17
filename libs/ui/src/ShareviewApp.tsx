import { setupIonicReact } from '@ionic/react';
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
import { ArtifactShareView } from './components/sharing/ArtifactShareView';
import { useMemo } from 'react';
import { PaneContext, PaneContextData } from './context/pane/PaneContext';
import {
  PaneableComponent,
  PaneableComponentProps,
} from './context/globalPane/PaneableComponent';
import {
  GlobalPaneContext,
  GlobalPaneContextData,
} from './context/globalPane/GlobalPaneContext';
import { Model } from 'flexlayout-react';
import { IonApp } from './IonicReact19Compat';

initI18Next();
setupIonicReact();

interface Props {
  id: string;
}
export const ShareviewApp: React.FC<Props> = (props) => {
  const globalPaneContextValue = useMemo<GlobalPaneContextData>(
    () => ({
      navigateHistoryBack: () => undefined, // Noop
      navigateHistoryForward: () => undefined, // Noop
      getPaneById: () => ({
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
      }),
      renamePane: () => undefined, // Noop
      focusedPaneId: props.id,
      getSelectedTabForTabset: () => undefined, // Noop
      navigate: (_, componentName, componentProps) => {
        if (componentName === PaneableComponent.Artifact) {
          const id = (componentProps as PaneableComponentProps['Artifact']).id;

          const url = new URL(`/artifact/${id}`, window.location.href);

          window.location.href = url.href;
        } else {
          // Noop
        }
      },
      resetLayout: () => undefined, // Noop
      _model: null as unknown as Model, // We have no good way to mock this
      _onActionListener: () => undefined, // Noop
      _onModelChangeListener: () => undefined, // Noop
    }),
    [],
  );

  const paneContextValue = useMemo<PaneContextData>(
    () => ({
      navigateHistoryBack: () => undefined, // Noop
      navigateHistoryForward: () => undefined, // Noop
      navigate: (componentName, componentProps) => {
        if (componentName === PaneableComponent.Artifact) {
          const id = (componentProps as PaneableComponentProps['Artifact']).id;

          const url = new URL(`/artifact/${id}`, window.location.href);

          window.location.href = url.href;
        } else {
          // Noop
        }
      },
      renamePane: () => undefined, // Noop
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
        <GlobalPaneContext.Provider value={globalPaneContextValue}>
          <PaneContext.Provider value={paneContextValue}>
            <ArtifactShareView artifactId={props.id} />
          </PaneContext.Provider>
        </GlobalPaneContext.Provider>
      </PreferencesContextProviderWrapper>
    </IonApp>
  );
};
