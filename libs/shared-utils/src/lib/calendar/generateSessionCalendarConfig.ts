import { Array as YArray } from 'yjs';
import type { YCalendarConfig } from './YCalendarConfig';

export const generateSessionCalendarConfig = (): YCalendarConfig => {
  return {
    calendarPreset: 'session',
    calendarStartDayOfWeek: 0, // Zero-indexed
    daysInWeek: 6,
    monthsInYear: 1,
    defaultCenter: `1.1.1`,
    daysInMonth: YArray.from([204]),
    leapInMonth: YArray.from([0]),
    monthNames: YArray.from(['']),
    dayOfWeekNames: YArray.from(['', '', '', '', '', '']),
  } satisfies YCalendarConfig;
};
