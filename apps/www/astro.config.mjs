import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://feynote.com';
const DEFAULT_LOCALE = 'en-us';
const DEFAULT_LOCALE_TAG = new Intl.Locale(DEFAULT_LOCALE).toString();

const i18nDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'src/i18n',
);
const localesDir = path.join(i18nDir, 'locales');

const requiredKeys = JSON.parse(
  fs.readFileSync(path.join(i18nDir, 'requiredKeys.json'), 'utf8'),
);

const supportedLocales = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''))
  .filter((locale) => {
    const strings = JSON.parse(
      fs.readFileSync(path.join(localesDir, `${locale}.json`), 'utf8'),
    );
    return requiredKeys.every((key) => strings[key] !== undefined);
  })
  .sort();

const sitemapLocales = Object.fromEntries(
  supportedLocales.map((locale) => [
    locale,
    new Intl.Locale(locale).toString(),
  ]),
);

const SITEMAP_EXCLUDED_PATHS = [
  '/404',
  '/payment/',
  '/workspace/',
  '/artifact/',
];

const ON_DEMAND_LOCALIZED_PATHS = ['/download/'];

const HOME_PATHS = new Set([
  '/',
  ...supportedLocales
    .filter((locale) => locale !== DEFAULT_LOCALE)
    .map((locale) => `/${locale}/`),
]);

const localizedCustomPages = supportedLocales
  .filter((locale) => locale !== DEFAULT_LOCALE)
  .flatMap((locale) =>
    ON_DEMAND_LOCALIZED_PATHS.map(
      (pagePath) => new URL(`/${locale}${pagePath}`, SITE).href,
    ),
  );

// https://astro.build/config
export default defineConfig({
  server: {
    // Listens on any origin host (0.0.0.0), necessary for dev env and deployment
    host: true,
  },
  site: SITE,
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: sitemapLocales,
      },
      customPages: localizedCustomPages,
      filter: (page) =>
        !SITEMAP_EXCLUDED_PATHS.some((excluded) =>
          new URL(page).pathname.startsWith(excluded),
        ),
      serialize: (item) => {
        const pathname = new URL(item.url).pathname;
        const defaultLink = item.links?.find(
          (link) => link.lang === DEFAULT_LOCALE_TAG,
        );

        return {
          ...item,
          links: defaultLink
            ? [...item.links, { url: defaultLink.url, lang: 'x-default' }]
            : item.links,
          changefreq: pathname.startsWith('/blog') ? 'monthly' : 'weekly',
          priority: HOME_PATHS.has(pathname) ? 1.0 : 0.8,
        };
      },
    }),
    mdx(),
  ],
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  image: {
    domains: ['static.feynote.com'],
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    server: {
      // Currently hardcoded since allowedHosts: true is broken (GH issue here: https://github.com/withastro/astro/issues/13060)
      allowedHosts: ['.tartarus.cloud', '.feynote.com'],
    },
    ssr: {
      // This marks the `path-to-regexp` package as external, so it won't be bundled in the server build
      // Necessary for how we render Ionic within Astro
      noExternal: ['path-to-regexp', 'zod'],
    },
  },
});
