import { t } from 'i18next';
import { sanitizeFilename as _sanitizeFilename } from '@feynote/shared-utils';

export const sanitizeFilename = (name: string): string => {
  return _sanitizeFilename(name, t('generic.untitled'));
};
