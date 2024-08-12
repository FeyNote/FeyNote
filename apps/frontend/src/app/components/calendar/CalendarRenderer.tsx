import { useMemo, useState, type ReactNode } from 'react';
import { Array as YArray } from 'yjs';
import type { TypedArray, TypedMap } from 'yjs-types';
import type { YCalendarConfig } from '@feynote/shared-utils';
import { ymdToDatestamp } from './ymdToDatestamp';
import { getStartDayOfWeekForMonth } from './getStartDayOfWeekForMonth';
import type { CalendarRenderArgs } from './CalendarRenderArgs';

interface Props {
  renderCalendar: (args: CalendarRenderArgs) => ReactNode;
  configMap: TypedMap<Partial<YCalendarConfig>>;
}

export const CalendarRenderer: React.FC<Props> = (props) => {
  const [center, setCenter] = useState<string>(
    props.configMap.get('center') ||
      `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate().toFixed()}`,
  );
  const centerParts = center.split('.');
  const centerYear = parseInt(centerParts[0]);
  const centerMonth = parseInt(centerParts[1]);
  const centerDay = parseInt(centerParts[1]);

  const startDayOfMonth = useMemo(() => {
    return getStartDayOfWeekForMonth(props.configMap, centerYear, centerMonth);
  }, [centerYear, centerMonth]); // TODO: Missing deps here

  const dayOfWeekNames =
    props.configMap.get('dayOfWeekNames') ||
    (new YArray() as TypedArray<string>);
  const monthNames =
    props.configMap.get('monthNames') || (new YArray() as TypedArray<string>);
  const daysInWeek = props.configMap.get('daysInWeek') || 1;
  const daysInMonth =
    props.configMap.get('daysInMonth')?.get(centerMonth - 1) || 1;
  const leapInMonth =
    props.configMap.get('leapInMonth')?.get(centerMonth - 1) || 0;
  const monthsInYear = props.configMap.get('monthsInYear') || 1;
  const firstWeekNumDays = daysInWeek - startDayOfMonth;
  const weekCount =
    1 + Math.ceil((daysInMonth - firstWeekNumDays) / daysInWeek);

  const moveCenter = (dir: number): void => {
    let newCenterYear = centerYear;
    let newCenterMonth = centerMonth + dir;

    if (newCenterMonth < 1) {
      newCenterMonth = monthsInYear;
      newCenterYear--;
    }
    if (newCenterMonth > monthsInYear) {
      newCenterMonth = 1;
      newCenterYear++;
    }

    setCenter(`${newCenterYear}.${newCenterMonth}.${centerDay}`);
  };

  const getDayNumber = (
    weekIdx: number,
    dayIdx: number,
  ): number | undefined => {
    const num = -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));

    const leapDays = centerYear % leapInMonth === 0 ? 1 : 0;

    if (num < 1) return undefined;
    if (num > daysInMonth + leapDays) return undefined;
    return -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));
  };

  const getDayInfo = (weekIdx: number, dayIdx: number) => {
    const dayNumber = getDayNumber(weekIdx, dayIdx);

    const datestamp =
      dayNumber !== undefined
        ? ymdToDatestamp({
            year: centerYear,
            month: centerMonth,
            day: dayNumber,
          })
        : undefined;

    if (!dayNumber || !datestamp) return;

    return {
      day: dayNumber,
      datestamp,
    };
  };

  return props.renderCalendar({
    moveCenter,
    centerYear,
    centerMonth,
    centerDay,
    dayOfWeekNames,
    monthNames,
    daysInWeek,
    weekCount,
    getDayInfo,
  });
};
