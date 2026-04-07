import type { ComponentProps } from 'react';
import { SinglePaneGlobalPaneContextProviderWrapper } from './globalPane/SinglePaneGlobalPaneContextProviderWrapper';
import { GlobalPaneContextProviderWrapper } from './globalPane/GlobalPaneContextProviderWrapper';
import { PreferencesContextProviderWrapper } from './preferences/PreferencesContextProviderWrapper';
import { Theme } from '@radix-ui/themes';
import { ToastContextProvider } from './toast/ToastContextProvider';

import { PaneableComponent } from './globalPane/PaneableComponent';
import { SidemenuContextProviderWrapper } from './sidemenu/SidemenuContextProviderWrapper';
import { GlobalSearchContextProviderWrapper } from './globalSearch/GlobalSearchContextProviderWrapper';
import { LocaldbStoreErrorHandlers } from '../utils/localDb/LocaldbStoreErrorHandlers';
import { SessionContextProviderWrapper } from './session/SessionContextProviderWrapper';
import { AlertContextProvider } from './alert/AlertContextProvider';
import { KeyboardShortcutContextProviderWrapper } from './keyboardShortcut/KeyboardShortcutContextProviderWrapper';
import { eventManager } from './events/EventManager';
import { EventName } from './events/EventName';

if (typeof window !== 'undefined') {
  window.addEventListener('online', () =>
    eventManager.broadcast(EventName.NavigatorOnline),
  );
  window.addEventListener('offline', () =>
    eventManager.broadcast(EventName.NavigatorOffline),
  );
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      eventManager.broadcast(EventName.NavigatorVisible);
    } else {
      eventManager.broadcast(EventName.NavigatorHidden);
    }
  });
}

interface Props {
  children: React.ReactNode;
  requireAuthentication?: boolean;
  singlePaneMode?: {
    navigationEventId: ComponentProps<
      typeof SinglePaneGlobalPaneContextProviderWrapper
    >['navigationEventId'];
    onNavigate: ComponentProps<
      typeof SinglePaneGlobalPaneContextProviderWrapper
    >['onNavigate'];
  };
}

export const GlobalContextContainer: React.FC<Props> = (props) => {
  const renderPaneProviders = (children: React.ReactNode) => {
    if (props.singlePaneMode) {
      return (
        <SinglePaneGlobalPaneContextProviderWrapper
          component={PaneableComponent.NonPanedComponent}
          props={{}}
          navigationEventId={props.singlePaneMode.navigationEventId}
          onNavigate={props.singlePaneMode.onNavigate}
        >
          <KeyboardShortcutContextProviderWrapper>
            {props.children}
          </KeyboardShortcutContextProviderWrapper>
        </SinglePaneGlobalPaneContextProviderWrapper>
      );
    }

    return (
      <GlobalPaneContextProviderWrapper>
        <KeyboardShortcutContextProviderWrapper>
          {children}
        </KeyboardShortcutContextProviderWrapper>
      </GlobalPaneContextProviderWrapper>
    );
  };

  const renderAuthenticatedProviders = (children: React.ReactNode) => {
    if (props.requireAuthentication) {
      return (
        <SessionContextProviderWrapper>
          <GlobalSearchContextProviderWrapper>
            <LocaldbStoreErrorHandlers />
            {children}
          </GlobalSearchContextProviderWrapper>
        </SessionContextProviderWrapper>
      );
    }

    return children;
  };

  return (
    <Theme>
      <AlertContextProvider>
        <ToastContextProvider>
          <PreferencesContextProviderWrapper>
            <SidemenuContextProviderWrapper>
              {renderPaneProviders(
                renderAuthenticatedProviders(props.children),
              )}
            </SidemenuContextProviderWrapper>
          </PreferencesContextProviderWrapper>
        </ToastContextProvider>
      </AlertContextProvider>
      <div id="portal-target"></div>
    </Theme>
  );
};
