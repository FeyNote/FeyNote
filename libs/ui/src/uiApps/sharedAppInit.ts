import '@radix-ui/themes/styles.css';

import '../css/global.css';
import { initI18Next } from '../i18n/initI18Next';
import { initDebugStoreMonkeypatch } from '../utils/localDb/debugStore';

export const sharedAppInit = () => {
  initDebugStoreMonkeypatch();

  initI18Next();
};
