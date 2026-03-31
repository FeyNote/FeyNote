import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc } from 'yjs';
import type { YTimelineEra, YTimelineMonth, YTimelineEvent, YTimelineConfig } from './YTimeline';
import type { TypedArray } from 'yjs-types';
import type { TypedYKV } from '../TypedYKV';

const TIMELINE_CONFIG_KEY = 'timelineConfig'
const TIMELINE_EVENTS_KEY = 'timelineEvents'
const TIMELINE_ADDITIONAL_ERAS_KEY = 'timelineAdditionalEras'
const TIMELINE_MONTHS_KEY = 'timelineMonthsKey'
const TIMELINE_WEEK_DAYS_KEY = 'timelineWeekDaysKey'
const TIMELINE_SELECTED_DISPLAY_FORMATS = 'timelineSelectedDisplayFormats'

export const getYTimelineFromYDoc = (yDoc: YDoc) => {
  const config = new YKeyValue(yDoc.getArray<{
    key: string;
    val: YTimelineConfig[keyof YTimelineConfig]
  }>(TIMELINE_CONFIG_KEY)) as TypedYKV<YTimelineConfig>


  const events = yDoc.getArray<YTimelineEvent>(TIMELINE_EVENTS_KEY) as TypedArray<YTimelineEvent>;
  const additionalEras = yDoc.getArray<YTimelineEra>(TIMELINE_ADDITIONAL_ERAS_KEY) as TypedArray<YTimelineEra>;
  const months = yDoc.getArray<YTimelineMonth>(TIMELINE_MONTHS_KEY) as TypedArray<YTimelineMonth>;
  const weekDays = yDoc.getArray<string>(TIMELINE_WEEK_DAYS_KEY) as TypedArray<string>;
  const timelineSelectedDisplayFormats = yDoc.getArray<string>(TIMELINE_SELECTED_DISPLAY_FORMATS) as TypedArray<string>;

  return {
    config,
    events,
    additionalEras,
    months,
    weekDays,
    timelineSelectedDisplayFormats,
  }
}
