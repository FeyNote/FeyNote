import WWW_REQUIRED_KEYS from './requiredKeys.json';

export const DEFAULT_LOCALE = 'en-us';

export const LOCALE_NAMES: Record<string, string> = {
  'en-us': 'English',
  'es-es': 'Español',
};

const i18nModules = import.meta.glob<Record<string, string>>(
  './locales/*.json',
  { eager: true, import: 'default' },
);

const i18nByLocale: Record<string, Record<string, string>> = {};
for (const [path, dict] of Object.entries(i18nModules)) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (!match) continue;
  i18nByLocale[match[1]] = dict;
}

export const WWW_SUPPORTED_LOCALES = Object.keys(i18nByLocale)
  .sort()
  .filter((locale) =>
    WWW_REQUIRED_KEYS.every((key) => i18nByLocale[locale]?.[key] !== undefined),
  );

export const DEFAULT_LOCALE_ONLY = [DEFAULT_LOCALE];

const RTL_LOCALES = new Set(['ar', 'fa', 'he', 'ur']);

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale.split('-')[0]);
}

export function toBcp47(locale: string): string {
  return new Intl.Locale(locale).toString();
}

export function toOgLocale(locale: string): string {
  const parsed = new Intl.Locale(locale);
  return parsed.region
    ? `${parsed.language}_${parsed.region}`
    : parsed.language;
}

export type Translator = (key: string) => string;

export function makeTranslator(locale: string): Translator {
  const dict = i18nByLocale[locale] ?? {};
  const fallback =
    locale === DEFAULT_LOCALE ? null : (i18nByLocale[DEFAULT_LOCALE] ?? null);
  return (key) => dict[key] ?? fallback?.[key] ?? key;
}

export function localePath(locale: string, path: string): string {
  const withSlash = path.endsWith('/') ? path : `${path}/`;
  if (locale === DEFAULT_LOCALE) return withSlash;
  return `/${locale}${withSlash}`;
}

export function stripLocalePrefix(pathname: string): string {
  for (const locale of WWW_SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}` || pathname === `/${locale}/`) return '/';
    if (pathname.startsWith(`/${locale}/`))
      return pathname.slice(locale.length + 1);
  }
  return pathname;
}
