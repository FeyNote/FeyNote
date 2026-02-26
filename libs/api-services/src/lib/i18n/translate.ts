import { readdir, readFile } from 'fs/promises';
import { join, parse } from 'path';
import acceptLanguage from 'accept-language';
import { SupportedLanguages } from './SupportedLanguages';
import { globalServerConfig } from '@feynote/config';
import { feynoteAsyncLocalStorage } from '../express/feynoteAsyncLocalStorage';

acceptLanguage.languages(Object.values(SupportedLanguages));

const loadedLanguageFileMap: Record<string, Record<string, string>> = {};

const loadPromise = (async () => {
  const fileNames = await readdir(globalServerConfig.i18nPath);
  for (const fileName of fileNames) {
    const filePath = join(globalServerConfig.i18nPath, fileName);
    const languageCode = parse(filePath).name;
    const fileContents = await readFile(filePath, 'utf8');
    loadedLanguageFileMap[languageCode] = JSON.parse(fileContents);
  }
})();

/**
 * This method is effectively the same as translate but does not wait for locales to be loaded from disk.
 * Prefer using translate rather than translateSync wherever possible.
 */
export const translateSync = (
  key: string,
  acceptLanguageHeader?: string,
): string => {
  const acceptI18N =
    acceptLanguageHeader ?? feynoteAsyncLocalStorage.getStore()?.acceptLanguage;
  if (!acceptI18N)
    throw new Error(
      'Server-side translate was used without an acceptLanguageHeader provided',
    );

  const lang = acceptLanguage.get(acceptI18N);
  if (!lang) return key;

  const translations = loadedLanguageFileMap[lang] || {};

  if (translations[key]) return translations[key];
  if (lang !== 'en-us') {
    const enTranslations = loadedLanguageFileMap['en-us'] || {};
    return enTranslations[key] || key;
  }
  return key;
};

/**
 * Translates a string server-side using the server set of translation files (not the frontend ones!).
 * Inside of a service being called from backend the acceptLanguageHeader does not need to be passed due to async local stroage. Other services such as the queue-worker will need to pass the acceptLanguageHeader arg.
 */
export const translate = async (
  key: string,
  acceptLanguageHeader?: string,
): Promise<string> => {
  await loadPromise;

  return translateSync(key, acceptLanguageHeader);
};
