import type { TypedMap } from 'yjs-types';
import { getYMDFromSpecifier } from './getYMDFromSpecifier';
import type { YCalendarConfig } from '@feynote/shared-utils';

export const isSessionCalendar = (
  configMap: TypedMap<Partial<YCalendarConfig>>,
) => {
  const defaultCenter = configMap.get('defaultCenter');
  if (!defaultCenter) return false;

  const ymd = getYMDFromSpecifier(defaultCenter);
  if (!ymd) return false;

  const monthCount = configMap.get('monthsInYear');
  if (!monthCount) return false;

  return ymd.year === 1 && monthCount === 1;
};
