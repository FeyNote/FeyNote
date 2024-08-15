import { Array as YArray } from 'yjs';
import type { YCalendarConfig } from './YCalendarConfig';

export const generateGregorianMondayCalendarConfig = (): YCalendarConfig => {
  return {
    calendarPreset: 'gregorian-monday',
    calendarStartDayOfWeek: 0, // Zero-indexed
    daysInWeek: 7,
    monthsInYear: 12,
    defaultCenter: null,
    daysInMonth: YArray.from([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]),
    leapInMonth: YArray.from([0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    monthNames: YArray.from([
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]),
    dayOfWeekNames: YArray.from([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]),
  } satisfies YCalendarConfig;
};
