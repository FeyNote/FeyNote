import { Array as YArray } from 'yjs';
import type { YCalendarConfig } from './YCalendarConfig';

export const DEFAULT_CALENDAR_CONFIG: YCalendarConfig = {
  calendarStartDayOfWeek: 0, // Zero-indexed
  daysInYear: 365,
  daysInWeek: 7,
  monthsInYear: 12,
  center: `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate().toFixed()}`,
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
