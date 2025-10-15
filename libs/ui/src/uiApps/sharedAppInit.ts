/* Ionic */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import '@radix-ui/themes/styles.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import { setupIonicReact } from '@ionic/react';

import '@ionic/react/css/palettes/dark.class.css';
import '../css/light.class.css';
import '../css/global.css';
import { initI18Next } from '../i18n/initI18Next';
import { initDebugStoreMonkeypatch } from '../utils/localDb/debugStore';

export const sharedAppInit = () => {
  initDebugStoreMonkeypatch();

  initI18Next();

  setupIonicReact();
};
