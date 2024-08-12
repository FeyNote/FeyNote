import { Home } from './Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { NotFound } from './NotFound';
import { Route } from 'react-router-dom';
import { Suspense } from 'react';

/* Ionic */
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
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
import { Menu } from './components/menu/Menu';

import '@ionic/react/css/palettes/dark.class.css';
import './css/global.css';
import { SessionContextProviderWrapper } from './context/session/SessionContextProviderWrapper';
import { Dashboard } from './components/dashboard/Dashboard';
import { routes } from './routes';
import { Artifact } from './components/artifact/Artifact';
import { AIThreadsList } from './components/assistant/AIThreadsList';
import { AIThread } from './components/assistant/AIThread';

import './i18n';
import { NewArtifact } from './components/artifact/NewArtifact';
import { Settings } from './components/settings/Settings';
import { PreferencesContextProviderWrapper } from './context/preferences/PreferencesContextProviderWrapper';
import { PreferencesContext } from './context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';
import { isLargeEnoughForSplitPane } from '../utils/isLargeEnoughForSplitPane';
import styled from 'styled-components';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { GlobalSearchContextProviderWrapper } from './context/globalSearch/GlobalSearchContextProviderWrapper';

const StyledSplitPane = styled(IonSplitPane)`
  --side-width: 250px;
`;

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
        <IonReactRouter>
          <SessionContextProviderWrapper>
            <PreferencesContextProviderWrapper>
              <GlobalSearchContextProviderWrapper>
                <PreferencesContext.Consumer>
                  {(preferencesContext) => (
                    <StyledSplitPane
                      when={
                        preferencesContext.getPreference(
                          PreferenceNames.EnableSplitPane,
                        ) && isLargeEnoughForSplitPane()
                      }
                      contentId="main"
                    >
                      <Menu />
                      <IonRouterOutlet id="main" animated={false}>
                        <Route
                          exact
                          path={routes.home.route}
                          component={Home}
                        />
                        <Route
                          exact
                          path={routes.login.route}
                          component={Login}
                        />
                        <Route
                          exact
                          path={routes.register.route}
                          component={Register}
                        />
                        <Route
                          exact
                          path={routes.dashboard.route}
                          component={Dashboard}
                        />
                        <Route
                          exact
                          path={routes.artifact.route}
                          component={Artifact}
                        />
                        <Route
                          exact
                          path={routes.newArtifact.route}
                          component={NewArtifact}
                        />
                        <Route
                          exact
                          path={routes.settings.route}
                          component={Settings}
                        />
                        <Route
                          exact
                          path={routes.assistant.route}
                          component={AIThreadsList}
                        />
                        <Route
                          exact
                          path={routes.assistantThread.route}
                          component={AIThread}
                        />
                        <Route component={NotFound} />
                      </IonRouterOutlet>
                    </StyledSplitPane>
                  )}
                </PreferencesContext.Consumer>
              </GlobalSearchContextProviderWrapper>
            </PreferencesContextProviderWrapper>
          </SessionContextProviderWrapper>
        </IonReactRouter>
      </IonApp>
    </Suspense>
  );
}

export default App;
