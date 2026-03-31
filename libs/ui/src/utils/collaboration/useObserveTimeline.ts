import {
  getYTimelineFromYDoc,
  YTimelineDateDisplayFormat,
  YTimelineDisplayFormat,
  YTimelineFormat,
} from '@feynote/shared-utils';
import { useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { useObserveYKVChanges } from './useObserveYKVChanges';
import { useObserveYArrayChanges } from './useObserveYArrayChanges';
import { useTranslation } from 'react-i18next';

export const useObserveTimeline = (yDoc: YDoc) => {
  const { t } = useTranslation();
  const yTimeline = useMemo(() => {
    return getYTimelineFromYDoc(yDoc)
  }, [yDoc])

  const { rerenderReducerValue: configRerenderReducer } = useObserveYKVChanges(yTimeline.config)
  const config = useMemo(() => {
    return {
      dateDisplayFormat: yTimeline.config.get('dateDisplayFormat') || YTimelineDateDisplayFormat.YYMMDD,
      timelineDefaultDisplayFormat: yTimeline.config.get('timelineDefaultDisplayFormat') || YTimelineDisplayFormat.List,
      timelineFormat: yTimeline.config.get('timelineFormat') || YTimelineFormat.Gregorian,
      startingEraBeginsAtZero: yTimeline.config.get('startingEraBeginsAtZero') || false,
      priorEraTitle: yTimeline.config.get('startingEraBeginsAtZero') || false,
      startingEraTitle: yTimeline.config.get('startingEraTitle') || t('timeline.startingEraTitle.default'),
      priorEraStart: yTimeline.config.get('priorEraStart') || {
        year: 3276,
        monthIdx: 0,
        dayIdx: 0,
        time: {

        }
      },
      weekWpochDayIndx: yTimeline.config.get('weekWpochDayIndx'),
      weekDaysResetEachMonth: yTimeline.config.get('weekDaysResetEachMonth'),
      hoursInDay: yTimeline.config.get('hoursInDay'),
      minutesInDay: yTimeline.config.get('minutesInDay'),
    };
  }, [configRerenderReducer]);

  const { rerenderReducerValue: eventsRerenderReducer } = useObserveYArrayChanges(yTimeline.events)
  const events = useMemo(() => {
    return yTimeline.events.toArray() || []
  }, [eventsRerenderReducer])

  const { rerenderReducerValue: additionalEraRerenderReducer } = useObserveYArrayChanges(yTimeline.additionalEras)
  const additionalEras = useMemo(() => {
    return yTimeline.additionalEras.toArray() || []
  }, [additionalEraRerenderReducer])

  const { rerenderReducerValue: timelineSelectedDisplayFormatsRerenderReducer } = useObserveYArrayChanges(yTimeline.timelineSelectedDisplayFormats)
  const timelineSelectedDisplayFormats = useMemo(() => {
    return yTimeline.timelineSelectedDisplayFormats.toArray() || []
  }, [timelineSelectedDisplayFormatsRerenderReducer])

  const { rerenderReducerValue: monthsRerenderReducer } = useObserveYArrayChanges(yTimeline.months)
  const months = useMemo(() => {
    return yTimeline.months.toArray() || [
      {
        title: t('timeline.month.januray'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.febuary'),
        numOfDays: 28,
        hasLeapDay: true,
      },
      {
        title: t('timeline.month.march'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.april'),
        numOfDays: 30,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.may'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.june'),
        numOfDays: 30,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.july'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.august'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.september'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.october'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.november'),
        numOfDays: 31,
        hasLeapDay: false,
      },
      {
        title: t('timeline.month.december'),
        numOfDays: 31,
        hasLeapDay: false,
      },
    ]
  }, [monthsRerenderReducer])

  const { rerenderReducerValue: weekDaysRerenderReducer } = useObserveYArrayChanges(yTimeline.weekDays)
  const weekDays = useMemo(() => {
    return yTimeline.weekDays.toArray() || [t('timeline.week.sunday'), t('monday'), t('timeline.week.tuesday'), t('timeline.week.wednesday'), t('timeline.week.thursday'), t('timeline.week.friday'), t('timeline.week.saturday')]
  }, [weekDaysRerenderReducer])

  return {
    config,
    configYKV: yTimeline.config,
    events,
    eventsYArray: yTimeline.events,
    additionalEras,
    additionalErasYArray: yTimeline.additionalEras,
    months,
    monthsYArray: yTimeline.months,
    weekDays,
    weekDaysYArray: yTimeline.weekDays,
    timelineSelectedDisplayFormats,
    timelineSelectedDisplayFormatsYArray: yTimeline.timelineSelectedDisplayFormats,
  };
};
