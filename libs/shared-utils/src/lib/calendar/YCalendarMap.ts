import { TypedMap } from 'yjs-types';
import type { YCalendarConfig } from './YCalendarConfig';

export interface YCalendarMap {
  config: TypedMap<Partial<YCalendarConfig>>;
}
