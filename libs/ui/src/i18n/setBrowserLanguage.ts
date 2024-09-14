import {
  SupportedLanguages,
  supportedRtlLanguages,
} from '@feynote/shared-utils';

export const setBrowserLanguage = (lang: string) => {
  document.documentElement.lang = lang;
  if (supportedRtlLanguages.includes(lang as SupportedLanguages)) {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }
};
