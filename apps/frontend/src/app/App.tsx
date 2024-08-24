import { Suspense } from 'react';

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
import { PaneControlContextProviderWrapper } from './context/paneControl/PaneControlContextProviderWrapper';
import { SidemenuContextProviderWrapper } from './context/sidemenu/SidemenuContextProviderWrapper';
import { Workspace } from './Workspace';
import { PaneTitleContextProviderWrapper } from './context/paneTitle/PaneTitleContextProviderWrapper';

const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

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

  return (
    <Suspense fallback="">
      <IonApp>
        <PaneControlContextProviderWrapper>
          <PaneTitleContextProviderWrapper>
            <SidemenuContextProviderWrapper>
              <SessionContextProviderWrapper>
                <PreferencesContextProviderWrapper>
                  <GlobalSearchContextProviderWrapper>
                    <Workspace />
                  </GlobalSearchContextProviderWrapper>
                </PreferencesContextProviderWrapper>
              </SessionContextProviderWrapper>
            </SidemenuContextProviderWrapper>
          </PaneTitleContextProviderWrapper>
        </PaneControlContextProviderWrapper>
      </IonApp>
    </Suspense>
  );
}

export default App;
