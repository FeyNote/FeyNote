/* Ionic */
import { IonApp } from '@ionic/react';
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import { setupIonicReact } from '@ionic/react';

import '@ionic/react/css/palettes/dark.class.css';
import './css/global.css';
import { SessionContextProviderWrapper } from './context/session/SessionContextProviderWrapper';

import './i18n';
import { PreferencesContextProviderWrapper } from './context/preferences/PreferencesContextProviderWrapper';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { GlobalSearchContextProviderWrapper } from './context/globalSearch/GlobalSearchContextProviderWrapper';
import { GlobalPaneContextProviderWrapper } from './context/globalPane/GlobalPaneContextProviderWrapper';
import { SidemenuContextProviderWrapper } from './context/sidemenu/SidemenuContextProviderWrapper';
import { Workspace } from './Workspace';
import { ArtifactShareView } from './components/sharing/sharedArtifactByToken/ArtifactShareView';
import { NotFound } from './NotFound';

const SW_UPDATE_INTERVAL_MS = 10 * 60 * 1000;

setupIonicReact();
export function App() {
  useRegisterSW({
    onRegistered(registration) {
      registration?.update();
      setInterval(() => {
        registration?.update();
      }, SW_UPDATE_INTERVAL_MS);
    },
  });

  const path = window.location.pathname.split('/').slice(1);

  if (!path.length || path[0] === '') {
    return (
      <IonApp>
        <GlobalPaneContextProviderWrapper>
          <SidemenuContextProviderWrapper>
            <PreferencesContextProviderWrapper>
              <SessionContextProviderWrapper>
                <GlobalSearchContextProviderWrapper>
                  <Workspace />
                </GlobalSearchContextProviderWrapper>
              </SessionContextProviderWrapper>
            </PreferencesContextProviderWrapper>
          </SidemenuContextProviderWrapper>
        </GlobalPaneContextProviderWrapper>
      </IonApp>
    );
  }

  if (path[0] === 'artifact' && path[1]) {
    return (
      <IonApp>
        <PreferencesContextProviderWrapper>
          <ArtifactShareView artifactId={path[1]} />
        </PreferencesContextProviderWrapper>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <PreferencesContextProviderWrapper>
        <NotFound />
      </PreferencesContextProviderWrapper>
    </IonApp>
  );
}

export default App;
