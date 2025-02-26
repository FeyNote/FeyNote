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
import './css/printView.css';
import { initI18Next } from './i18n/initI18Next';
import { PreferencesContextProviderWrapper } from './context/preferences/PreferencesContextProviderWrapper';
import { useMemo, useRef } from 'react';
import { PaneContext, PaneContextData } from './context/pane/PaneContext';
import { PaneableComponent } from './context/globalPane/PaneableComponent';
import {
  GlobalPaneContext,
  GlobalPaneContextData,
} from './context/globalPane/GlobalPaneContext';
import { Model } from 'flexlayout-react';
import { IonApp } from './IonicReact19Compat';
import { ReadonlyArtifactViewer } from './components/artifact/ReadonlySimpleArtifact';

initI18Next();
setupIonicReact();

interface Props {
  id: string;
}
export const PrintviewApp: React.FC<Props> = (props) => {
  const autoPrintTriggeredRef = useRef(false);

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
      navigate: () => {
        // We do not support navigation in the print view
        return;
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
      navigate: () => {
        // We do not support navigation in the print view
        return;
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
    <IonApp>
      <PreferencesContextProviderWrapper>
        <GlobalPaneContext.Provider value={globalPaneContextValue}>
          <PaneContext.Provider value={paneContextValue}>
            <ReadonlyArtifactViewer artifactId={props.id} onReady={onReady} />
          </PaneContext.Provider>
        </GlobalPaneContext.Provider>
      </PreferencesContextProviderWrapper>
    </IonApp>
  );
};
