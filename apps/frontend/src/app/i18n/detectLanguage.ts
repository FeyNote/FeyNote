import { LanguageLocalityMap, SupportedLanguages } from './types';

export const FALLBACK_LANGUAGE = SupportedLanguages.EN_US;

export const detectLanguage = () => {
  const navigatorLanguage = window.navigator.language.toLowerCase();

  if (languageIsSupported(navigatorLanguage)) {
    console.log('language supported;', navigatorLanguage);
    return navigatorLanguage;
  }

  const baseLanguage = navigatorLanguage.split('-')[0];
  const somevar =
    LanguageLocalityMap[baseLanguage as keyof typeof LanguageLocalityMap] ||
    FALLBACK_LANGUAGE;
  return somevar;
};

const languageIsSupported = (
  language: string
): language is SupportedLanguages => {
  return Object.values(SupportedLanguages).some(
    (supportedLanguage) => supportedLanguage === language
  );
};
