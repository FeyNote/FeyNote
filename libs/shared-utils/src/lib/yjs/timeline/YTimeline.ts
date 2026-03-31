export interface YTimelineConfig {
  startingEraBeginsAtZero: boolean;
  priorEraTitle: string;
  startingEraTitle: string; // Not an era object since the start time is predetermined
  priorEraStart: YTimelineDate;
  weekWpochDayIndx: number;
  weekDaysResetEachMonth: boolean;
  hoursInDay: number;
  minutesInDay: number;
  dateDisplayFormat: YTimelineDateDisplayFormat;
  timelineDefaultDisplayFormat: YTimelineDisplayFormat;
  timelineFormat: YTimelineFormat;
}

export enum YTimelineFormat {
  Harptos = 'harptos',
  Exandria = 'exandria',
  Eberron = 'eberron',
  Gregorian = 'gregorian',
  Custom = 'custom',
}

export enum YTimelineDisplayFormat {
  List = 'list',
  Gantt = 'gantt',
  Calendar = 'calendar'
}

export enum YTimelineDateDisplayFormat {
  YYMMDD = 'YYMMDD'
}

export interface YTimelineEvent {
  id: string;
  title: string;
  start: YTimelineDate;
  end: YTimelineDate;
  text: string;
  color: string;
}

export interface YTimelineDate {
  year: number;
  monthIdx: number;
  dayIdx: number;
  time: {
    hour: number;
    minute: number;
    second: number;
  }
}

export interface YTimelineMonth {
  title: string;
  numOfDays: number;
  hasLeapDay: boolean;
}

export interface YTimelineEra {
  title: string;
  start: YTimelineDate;
}
