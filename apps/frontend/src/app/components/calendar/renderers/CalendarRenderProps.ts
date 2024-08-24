import type { TypedArray } from 'yjs-types';

export interface CalendarRenderProps {
  moveCenter: (direction: -1 | 1) => void;
  centerYear: number;
  centerMonth: number;
  centerDay: number;
  dayOfWeekNames: TypedArray<string>;
  monthNames: TypedArray<string>;
  daysInWeek: number;
  weekCount: number;
  getDayInfo: (
    weekIdx: number,
    dayIdx: number,
  ) => { day: number; datestamp: string } | undefined;
  selectedDate?: string;
  onDayClicked?: (date: string) => void;
}
