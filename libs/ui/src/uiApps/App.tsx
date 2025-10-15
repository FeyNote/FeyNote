import { sharedAppInit } from './sharedAppInit';

import { useRegisterSW } from 'virtual:pwa-register/react';
import { ResetEmail } from '../components/auth/ResetEmail';
import { GlobalContextContainer } from '../context/GlobalContextContainer';
import { ResetPassword } from '../components/auth/ResetPassword';
import { PrintviewApp } from './PrintviewApp';
import { Workspace } from '../Workspace';
import { NotFound } from '../NotFound';

sharedAppInit();

const SW_UPDATE_INTERVAL_MS = 10 * 60 * 1000;

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

        // Periodic sync is not ratified yet and so therefore do not exist in typings
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
      }
    },
  });

  const url = new URL(window.location.href);
  const path = window.location.pathname.split('/').slice(1);

  const resetEmailToken = url.searchParams.get('resetEmailToken');
  if (resetEmailToken) {
    return (
      <GlobalContextContainer
        singlePaneMode={{
          navigationEventId: 'resetemail',
          onNavigate: () => {
            // noop
          },
        }}
      >
        <ResetEmail
          authResetToken={resetEmailToken}
          redirectPath={window.location.origin}
        />
      </GlobalContextContainer>
    );
  }

  const resetPasswordToken = url.searchParams.get('resetPasswordToken');
  if (resetPasswordToken) {
    return (
      <GlobalContextContainer
        singlePaneMode={{
          navigationEventId: 'resetemail',
          onNavigate: () => {
            // noop
          },
        }}
      >
        <ResetPassword
          authResetToken={resetPasswordToken}
          redirectPath={window.location.origin}
        />
      </GlobalContextContainer>
    );
  }

  const printArtifactId = url.searchParams.get('printArtifactId');
  if (printArtifactId) {
    return <PrintviewApp id={printArtifactId} />;
  }

  if (!path.length || path[0] === '') {
    return (
      <GlobalContextContainer requireAuthentication={true}>
        <Workspace />
      </GlobalContextContainer>
    );
  }

  return (
    <GlobalContextContainer
      singlePaneMode={{
        navigationEventId: 'notfound',
        onNavigate: () => {
          // noop
        },
      }}
    >
      <NotFound />
    </GlobalContextContainer>
  );
}
