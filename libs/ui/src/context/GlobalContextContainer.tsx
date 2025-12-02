import type { ComponentProps } from 'react';
import { SinglePaneGlobalPaneContextProviderWrapper } from './globalPane/SinglePaneGlobalPaneContextProviderWrapper';
import { GlobalPaneContextProviderWrapper } from './globalPane/GlobalPaneContextProviderWrapper';
import { PreferencesContextProviderWrapper } from './preferences/PreferencesContextProviderWrapper';
import { Theme } from '@radix-ui/themes';
import { ToastContextProvider } from './toast/ToastContextProvider';
import { IonApp } from '@ionic/react';
import { PaneableComponent } from './globalPane/PaneableComponent';
import { SidemenuContextProviderWrapper } from './sidemenu/SidemenuContextProviderWrapper';
import { GlobalSearchContextProviderWrapper } from './globalSearch/GlobalSearchContextProviderWrapper';
import { LocaldbStoreErrorHandlers } from '../utils/localDb/LocaldbStoreErrorHandlers';
import { SessionContextProviderWrapper } from './session/SessionContextProviderWrapper';
import { AlertContextProvider } from './alert/AlertContextProvider';

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
          {props.children}
        </SinglePaneGlobalPaneContextProviderWrapper>
      );
    }

    return (
      <GlobalPaneContextProviderWrapper>
        {children}
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
                <IonApp>{renderAuthenticatedProviders(props.children)}</IonApp>,
              )}
            </SidemenuContextProviderWrapper>
          </PreferencesContextProviderWrapper>
        </ToastContextProvider>
      </AlertContextProvider>
      <div id="portal-target"></div>
    </Theme>
  );
};
