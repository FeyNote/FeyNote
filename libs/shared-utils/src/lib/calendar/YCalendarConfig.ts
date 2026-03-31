import { TypedArray } from 'yjs-types';

export interface YCalendarConfig {
  preset: 'gregorian-monday' | 'gregorian-sunday' | 'session' | 'custom';
  calendarStartDayOfWeek: number; // Zero-indexed
  daysInWeek: number;
  monthsInYear: number;
  daysInMonth: TypedArray<number>;
  defaultCenter: string | null;
  leapInMonth: TypedArray<number>;
  monthNames: TypedArray<string>;
  dayOfWeekNames: TypedArray<string>;
}
