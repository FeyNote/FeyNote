import { Array as YArray } from 'yjs';
import type { YCalendarConfig } from '@feynote/shared-utils';
import type { TypedMap } from 'yjs-types';

export const getStartDayOfWeekForMonth = (
  configMap: TypedMap<Partial<YCalendarConfig>>,
  findYear: number,
  findMonth: number,
): number => {
  if (findYear < 0 || findMonth < 0) throw new Error();
  const calendarStartDayOfWeek = configMap.get('calendarStartDayOfWeek') || 0;
  const daysInWeek = configMap.get('daysInWeek') || 1;
  const monthsInYear = configMap.get('monthsInYear') || 1;
  const daysInMonthList = configMap.get('daysInMonth') || new YArray();
  const leapInMonthList = configMap.get('leapInMonth') || new YArray();

  let dayOfWeek = calendarStartDayOfWeek;
  if (findYear === 0 && findMonth === 0) return calendarStartDayOfWeek;

  let year = 1;
  let lastMonthYear = 0;
  let month = 1;
  let lastMonth = 0;
  if (month >= monthsInYear) {
    month = 0;
    year++;
  }

  while (year <= findYear) {
    const daysInLastMonth = daysInMonthList.get(lastMonth);
    const leapInLastMonth = leapInMonthList.get(lastMonth);

    // Must avoid year 0 being considered as leap year!
    const leapDays =
      leapInLastMonth && lastMonthYear && lastMonthYear % leapInLastMonth === 0
        ? 1
        : 0;
    /**
     * The difference between last month's dayOfWeek and this month's dayOfWeek
     */
    const dayOfWeekDiff = (daysInLastMonth + leapDays) % daysInWeek;

    dayOfWeek = dayOfWeek + dayOfWeekDiff;
    if (dayOfWeek < 0) {
      dayOfWeek = daysInWeek + dayOfWeek;
    }
    if (dayOfWeek > daysInWeek - 1) {
      dayOfWeek = dayOfWeek - daysInWeek;
    }

    if (year >= findYear && month >= findMonth - 1) {
      break;
    }

    lastMonth = month;
    lastMonthYear = year;
    month++;
    if (month >= monthsInYear) {
      month = 0;
      year++;
    }
  }

  return dayOfWeek;
};
