import { t } from 'i18next';

const UNSAFE_CHARS = /[/\\:*?"<>|]/g;
const TRAILING_DOTS_SPACES = /[.\s]+$/;
const LEADING_DOTS_SPACES = /^[.\s]+/;
const MAX_LENGTH = 200;

export const sanitizeFilename = (name: string): string => {
  let sanitized = name
    .replace(UNSAFE_CHARS, '_')
    .replace(LEADING_DOTS_SPACES, '')
    .replace(TRAILING_DOTS_SPACES, '');

  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.slice(0, MAX_LENGTH);
  }

  return sanitized || t('generic.untitled');
};
