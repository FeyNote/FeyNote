/* Ionic */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import { setupIonicReact } from '@ionic/react';

import '@ionic/react/css/palettes/dark.class.css';
import './light.class.css';
// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../../libs/ui/src/css/global.css';

import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  SessionContextProviderWrapper,
  PreferencesContextProviderWrapper,
  GlobalSearchContextProviderWrapper,
  GlobalPaneContextProviderWrapper,
  SidemenuContextProviderWrapper,
  ToastContextProvider,
  NotFound,
  Workspace,
  initI18Next,
  ResetPassword,
  ResetEmail,
  IonApp,
  PrintviewApp,
  LocaldbStoreErrorHandlers,
  initDebugStoreMonkeypatch,
} from '@feynote/ui';

initDebugStoreMonkeypatch();

initI18Next();

const SW_UPDATE_INTERVAL_MS = 10 * 60 * 1000;

setupIonicReact();
export function App() {
  useRegisterSW({
    onRegisteredSW(swURL, registration) {
      if (registration) {
        setInterval(async () => {
          if (registration.installing || !navigator) return;

          if ('connection' in navigator && !navigator.onLine) return;

          const resp = await fetch(swURL, {
            cache: 'no-store',
            headers: {
              cache: 'no-store',
              'cache-control': 'no-cache',
            },
          });

          if (resp?.status === 200) {
            await registration.update();
          }
        }, SW_UPDATE_INTERVAL_MS);

        registration?.sync?.register('manifest').catch((e: unknown) => {
          console.error('Cannot register background sync', e);
        });

        // Periodic sync is not ratified yet and so therefore do not exist in typings
        const swRegistration = registration as unknown as
          | {
              periodicSync?: {
                register: (
                  name: string,
                  options: { minInterval: number },
                ) => Promise<void>;
              };
            }
          | undefined;

        const PERIODIC_SYNC_INTERVAL_HOURS = 48;
        swRegistration?.periodicSync
          ?.register('manifest', {
            minInterval: PERIODIC_SYNC_INTERVAL_HOURS * 60 * 60 * 1000,
          })
          .catch((e: unknown) => {
            console.error('Cannot register periodic sync', e);
          });
      }
    },
  });

  const url = new URL(window.location.href);
  const path = window.location.pathname.split('/').slice(1);

  const resetEmailToken = url.searchParams.get('resetEmailToken');
  if (resetEmailToken) {
    return (
      <Theme>
        <ToastContextProvider>
          <GlobalPaneContextProviderWrapper>
            <IonApp>
              <PreferencesContextProviderWrapper>
                <ResetEmail
                  authResetToken={resetEmailToken}
                  redirectPath={window.location.origin}
                />
              </PreferencesContextProviderWrapper>
            </IonApp>
          </GlobalPaneContextProviderWrapper>
        </ToastContextProvider>
      </Theme>
    );
  }

  const resetPasswordToken = url.searchParams.get('resetPasswordToken');
  if (resetPasswordToken) {
    return (
      <Theme>
        <ToastContextProvider>
          <GlobalPaneContextProviderWrapper>
            <IonApp>
              <PreferencesContextProviderWrapper>
                <ResetPassword
                  authResetToken={resetPasswordToken}
                  redirectPath={window.location.origin}
                />
              </PreferencesContextProviderWrapper>
            </IonApp>
          </GlobalPaneContextProviderWrapper>
        </ToastContextProvider>
      </Theme>
    );
  }

  const printArtifactId = url.searchParams.get('printArtifactId');
  if (printArtifactId) {
    return <PrintviewApp id={printArtifactId} />;
  }

  if (!path.length || path[0] === '') {
    return (
      <Theme>
        <ToastContextProvider>
          <GlobalPaneContextProviderWrapper>
            <IonApp>
              <SidemenuContextProviderWrapper>
                <PreferencesContextProviderWrapper>
                  <SessionContextProviderWrapper>
                    <GlobalSearchContextProviderWrapper>
                      <LocaldbStoreErrorHandlers />
                      <Workspace />
                    </GlobalSearchContextProviderWrapper>
                  </SessionContextProviderWrapper>
                </PreferencesContextProviderWrapper>
              </SidemenuContextProviderWrapper>
            </IonApp>
          </GlobalPaneContextProviderWrapper>
        </ToastContextProvider>
      </Theme>
    );
  }

  return (
    <Theme>
      <IonApp>
        <PreferencesContextProviderWrapper>
          <NotFound />
        </PreferencesContextProviderWrapper>
      </IonApp>
    </Theme>
  );
}

export default App;
