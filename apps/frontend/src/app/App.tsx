import { Home } from './Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { NotFound } from './NotFound';
import { Route } from 'react-router-dom';
import { Suspense, useEffect } from 'react';

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

import './i18n';
import { NewArtifact } from './components/artifact/NewArtifact';
import { Settings } from './components/settings/Settings';
import { PreferencesContextProviderWrapper } from './context/preferences/PreferencesContextProviderWrapper';

setupIonicReact();
export function App() {
  return (
    <Suspense fallback="">
      <IonApp>
        <IonReactRouter>
          <SessionContextProviderWrapper>
            <PreferencesContextProviderWrapper>
              <IonSplitPane when="false" contentId="main">
                <Menu />
                <IonRouterOutlet id="main" animated={false}>
                  <Route exact path={routes.home.route} component={Home} />
                  <Route exact path={routes.login.route} component={Login} />
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
                  <Route component={NotFound} />
                </IonRouterOutlet>
              </IonSplitPane>
            </PreferencesContextProviderWrapper>
          </SessionContextProviderWrapper>
        </IonReactRouter>
      </IonApp>
    </Suspense>
  );
}

export default App;
