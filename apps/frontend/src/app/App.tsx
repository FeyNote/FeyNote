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
// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../../libs/ui/src/css/global.css';

import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  SessionContextProviderWrapper,
  PreferencesContextProviderWrapper,
  GlobalSearchContextProviderWrapper,
  GlobalPaneContextProviderWrapper,
  SidemenuContextProviderWrapper,
  NotFound,
  Workspace,
  initI18Next,
  PasswordReset,
} from '@feynote/ui';

initI18Next();

const SW_UPDATE_INTERVAL_MS = 10 * 60 * 1000;

setupIonicReact();
export function App() {
  useRegisterSW({
    onRegistered(registration) {
      registration?.update();
      setInterval(() => {
        registration?.update();
      }, SW_UPDATE_INTERVAL_MS);

      // Sync and periodic sync are not ratified yet and so therefore do not exist in typings
      const swRegistration = registration as unknown as
        | {
            sync?: {
              register: (name: string) => Promise<void>;
            };
            periodicSync?: {
              register: (
                name: string,
                options: { minInterval: number },
              ) => Promise<void>;
            };
          }
        | undefined;

      swRegistration?.sync?.register('manifest').catch((e: unknown) => {
        console.error('Cannot register background sync', e);
      });

      const PERIODIC_SYNC_INTERVAL_HOURS = 48;
      swRegistration?.periodicSync
        ?.register('manifest', {
          minInterval: PERIODIC_SYNC_INTERVAL_HOURS * 60 * 60 * 1000,
        })
        .catch((e: unknown) => {
          console.error('Cannot register periodic sync', e);
        });
    },
  });

  const url = new URL(window.location.href);
  const path = window.location.pathname.split('/').slice(1);

  const passworeResetToken = url.searchParams.get('passwordResetToken');
  if (passworeResetToken) {
    return (
      <GlobalPaneContextProviderWrapper>
        <IonApp>
          <PreferencesContextProviderWrapper>
            <PasswordReset
              passwordResetToken={passworeResetToken}
              redirectPath={window.location.origin}
            />
          </PreferencesContextProviderWrapper>
        </IonApp>
      </GlobalPaneContextProviderWrapper>
    );
  }

  if (!path.length || path[0] === '') {
    return (
      <GlobalPaneContextProviderWrapper>
        <IonApp>
          <SidemenuContextProviderWrapper>
            <PreferencesContextProviderWrapper>
              <SessionContextProviderWrapper>
                <GlobalSearchContextProviderWrapper>
                  <Workspace />
                </GlobalSearchContextProviderWrapper>
              </SessionContextProviderWrapper>
            </PreferencesContextProviderWrapper>
          </SidemenuContextProviderWrapper>
        </IonApp>
      </GlobalPaneContextProviderWrapper>
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
