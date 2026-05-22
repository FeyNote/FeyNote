import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc } from 'yjs';
import type { YTimelineEra, YTimelineMonth, YTimelineEvent, YTimelineConfig } from './YTimeline';
import type { TypedArray } from 'yjs-types';
import type { TypedYKV } from '../TypedYKV';

const TIMELINE_CONFIG_KEY = 'timelineConfig'
const TIMELINE_EVENTS_KEY = 'timelineEvents'
const TIMELINE_ADDITIONAL_ERAS_KEY = 'timelineAdditionalEras'
const TIMELINE_MONTHS_KEY = 'timelineMonths'
const TIMELINE_WEEK_DAYS_KEY = 'timelineWeekDays'
const TIMELINE_DATE_DISPLAY_FORMATS_KEY = 'timelineDateDisplayFormats'
const TIMELINE_MOONS_KEY = 'timelineMoons'
const TIMELINE_DISPLAY_TYPES = 'timelineDisplayTypes'

export const getYTimelineFromYDoc = (yDoc: YDoc) => {
  const config = new YKeyValue(yDoc.getArray<{
    key: string;
    val: YTimelineConfig[keyof YTimelineConfig]
  }>(TIMELINE_CONFIG_KEY)) as TypedYKV<YTimelineConfig>

  const events = yDoc.getArray<YTimelineEvent>(TIMELINE_EVENTS_KEY) as TypedArray<YTimelineEvent>;
  const additionalEras = yDoc.getArray<YTimelineEra>(TIMELINE_ADDITIONAL_ERAS_KEY) as TypedArray<YTimelineEra>;
  const months = yDoc.getArray<YTimelineMonth>(TIMELINE_MONTHS_KEY) as TypedArray<YTimelineMonth>;
  const weekDays = yDoc.getArray<string>(TIMELINE_WEEK_DAYS_KEY) as TypedArray<string>;
  const dateDisplayFormats = yDoc.getArray<string>(TIMELINE_DATE_DISPLAY_FORMATS_KEY) as TypedArray<string>;
  const moons = yDoc.getArray<string>(TIMELINE_MOONS_KEY) as TypedArray<string>;
  const displayTypes = yDoc.getArray<string>(TIMELINE_DISPLAY_TYPES) as TypedArray<string>;

  return {
    config,
    events,
    additionalEras,
    months,
    weekDays,
    dateDisplayFormats,
    moons,
    displayTypes,
  }
}
