import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type MutableRefObject,
} from 'react';
import { Array as YArray } from 'yjs';
import type { TypedArray, TypedMap } from 'yjs-types';
import type { YCalendarConfig } from '@feynote/shared-utils';
import { ymdToDatestamp } from './ymdToDatestamp';
import { getStartDayOfWeekForMonth } from './getStartDayOfWeekForMonth';
import type { CalendarRenderArgs } from './CalendarRenderArgs';
import type { ArtifactDTO } from '@feynote/prisma/types';
import { renderFullsizeCalendar } from './renderFullsizeCalendar';
import { getCurrentGregorianDatestamp } from './getCurrentGregorianDatestamp';

interface Props {
  options:
    | {
        type: 'fullsize';
        knownReferencesByDay: Record<
          string,
          ArtifactDTO['incomingArtifactReferences']
        >;
      }
    | {
        type: 'mini';
      };
  configMap: TypedMap<Partial<YCalendarConfig>>;
  setCenterRef?: MutableRefObject<(center: string) => void | undefined>;
}

export const CalendarRenderer: React.FC<Props> = (props) => {
  const [center, setCenter] = useState<string>(
    props.configMap.get('defaultCenter') || getCurrentGregorianDatestamp(),
  );
  if (props.setCenterRef) {
    props.setCenterRef.current = setCenter;
  }
  const centerParts = center.split('.');
  const centerYear = parseInt(centerParts[0]);
  const centerMonth = parseInt(centerParts[1]);
  const centerDay = parseInt(centerParts[1]);
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };

    props.configMap.observeDeep(listener);
    return () => props.configMap.unobserveDeep(listener);
  }, [_rerenderReducerValue]);

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

  const renderCalendar = (args: CalendarRenderArgs) => {
    switch (props.options.type) {
      case 'fullsize': {
        return renderFullsizeCalendar({
          ...args,
          knownReferencesByDay: props.options.knownReferencesByDay,
        });
      }
      case 'mini': {
        // TODO: mini calendar impl
        return renderFullsizeCalendar({
          ...args,
          knownReferencesByDay: {},
        });
      }
    }

    throw new Error(
      `Invalid render type passed ${(props.options as any).type}`,
    );
  };

  return renderCalendar({
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
