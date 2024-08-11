import { TypedArray } from 'yjs-types';

export interface YCalendarConfig {
  calendarStartDayOfWeek: number; // Zero-indexed
  daysInYear: number;
  daysInWeek: number;
  monthsInYear: number;
  center: string;
  daysInMonth: TypedArray<number>;
  leapInMonth: TypedArray<number>;
  monthNames: TypedArray<string>;
  dayOfWeekNames: TypedArray<string>;
}
