import { Home } from './Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { NotFound } from './NotFound';
import { Route } from 'react-router-dom';
import { useEffect } from 'react';

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

import './css/themes/dark.css';
import { SessionContextProviderWrapper } from './context/session/SessionContextProviderWrapper';
import { Dashboard } from './components/dashboard/Dashboard';
import { Routes } from './routes';

import './i18n';

setupIonicReact();
export function App() {
  const toggleDarkTheme = (shouldAdd: boolean) => {
    document.body.classList.toggle('dark', shouldAdd);
  };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    toggleDarkTheme(prefersDark.matches);
    prefersDark.addEventListener('change', (mediaQuery) =>
      toggleDarkTheme(mediaQuery.matches)
    );
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <SessionContextProviderWrapper>
          <IonSplitPane when="lg" contentId="main">
            <Menu />
            <IonRouterOutlet id="main" animated={false}>
              <Route exact path={Routes.Home} component={Home} />
              <Route exact path={Routes.Login} component={Login} />
              <Route exact path={Routes.Register} component={Register} />
              <Route exact path={Routes.Dashboard} component={Dashboard} />
              <Route component={NotFound} />
            </IonRouterOutlet>
          </IonSplitPane>
        </SessionContextProviderWrapper>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
