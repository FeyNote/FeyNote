import { TiptapCollabProvider } from '@hocuspocus/provider';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import type { ArtifactTheme } from '@prisma/client';
import { ArtifactEditorApplyTemplate } from '../editor/ArtifactEditor';
import { useEffect, useMemo, useReducer } from 'react';
import * as Y from 'yjs';
import {
  IonCard,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonList,
  IonRow,
} from '@ionic/react';
import { CalendarRenderer } from './CalendarRenderer';

interface YCalendarEntry {
  title: string;
}

/**
 * Must be bounded since this can cause major performance issues
 */
const MAX_MONTHS_IN_YEAR = 24;

/**
 * Must be bounded since this can cause major performance issues
 */
const MAX_DAYS_IN_YEAR = 1000;

/**
 * Must be bounded since this can cause major performance issues
 */
const MAX_DAYS_IN_WEEK = 14;

const DEFAULT_CALENDAR_CONFIG = {
  calendarStartDayOfWeek: 0, // Zero-indexed
  daysInYear: 365,
  daysInWeek: 7,
  monthsInYear: 12,
  center: `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate().toFixed()}`,
  daysInMonth: Y.Array.from([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]),
  leapInMonth: Y.Array.from([0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  monthNames: Y.Array.from([
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]),
  dayOfWeekNames: Y.Array.from([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]),
};

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  yjsProvider: TiptapCollabProvider;
  theme: ArtifactTheme;
  applyTemplateRef?: React.MutableRefObject<
    ArtifactEditorApplyTemplate | undefined
  >;
  onReady?: () => void;
}

export interface DocData {
  calendarMap: Y.Map<any>;
  entries: Y.Array<YCalendarEntry>;
  config: Y.Map<any>;
}

export const ArtifactCalendar: React.FC<Props> = (props) => {
  const yDoc = props.yjsProvider.document;
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const docData: DocData = useMemo(() => {
    const calendarMap = yDoc.getMap<any>('calendar');

    if (!calendarMap.has('entries')) {
      calendarMap.set('entries', new Y.Array());
    }
    const entries: Y.Array<YCalendarEntry> = calendarMap.get('entries');

    if (!calendarMap.has('config')) {
      calendarMap.set(
        'config',
        new Y.Map(Object.entries(DEFAULT_CALENDAR_CONFIG)),
      );
    }
    const config: Y.Map<any> = calendarMap.get('config');

    return {
      calendarMap,
      entries,
      config,
    };
  }, [_rerenderReducerValue]);

  useEffect(() => {
    const listener = () => {
      console.log('rerendering');
      triggerRerender();
    };

    docData.calendarMap.observeDeep(listener);
    return () => docData.calendarMap.unobserveDeep(listener);
  }, [_rerenderReducerValue]);

  const onDaysInYearChange = (value: string) => {
    if (!value.length) return;

    docData.config.set(
      'daysInYear',
      Math.min(parseInt(value), MAX_DAYS_IN_YEAR),
    );
  };
  const onDaysInWeekChange = (value: string) => {
    if (!value.length) return;

    docData.config.set(
      'daysInWeek',
      Math.min(parseInt(value), MAX_DAYS_IN_WEEK),
    );
  };

  const onMonthsInYearChange = (value: string) => {
    if (!value.length) return;

    docData.config.set(
      'monthsInYear',
      Math.min(parseInt(value), MAX_MONTHS_IN_YEAR),
    );
  };
  const onMonthNameChange = (idx: number, value: string) => {
    if (!docData.config.has('monthNames')) {
      docData.config.set('monthNames', new Y.Array());
    }
    const monthNames: Y.Array<string> = docData.config.get('monthNames');

    yDoc.transact(() => {
      const monthsInYear = docData.config.get('monthsInYear') || 1;
      if (monthNames.length > monthsInYear) {
        monthNames.delete(monthsInYear - 1, monthNames.length - monthsInYear);
      }
      if (monthNames.length < monthsInYear) {
        monthNames.insert(
          monthNames.length,
          new Array(monthsInYear - monthNames.length).fill(''),
        );
      }

      monthNames.delete(idx);
      monthNames.insert(idx, [value]);
    });
  };
  const getMonthName = (idx: number) => {
    const monthNames: Y.Array<string> = docData.config.get('monthNames');
    if (!monthNames) return '';

    return monthNames.get(idx);
  };
  const onDaysInMonthChange = (idx: number, value: string) => {
    if (!value) return;

    if (!docData.config.has('daysInMonth')) {
      docData.config.set('daysInMonth', new Y.Array());
    }
    const daysInMonth: Y.Array<number> = docData.config.get('daysInMonth');

    yDoc.transact(() => {
      const monthsInYear = docData.config.get('monthsInYear') || 1;
      if (daysInMonth.length > monthsInYear) {
        daysInMonth.delete(monthsInYear - 1, daysInMonth.length - monthsInYear);
      }
      if (daysInMonth.length < monthsInYear) {
        daysInMonth.insert(
          daysInMonth.length,
          new Array(monthsInYear - daysInMonth.length).fill(1),
        );
      }

      daysInMonth.delete(idx);
      daysInMonth.insert(idx, [parseInt(value)]);
    });
  };
  const getDaysInMonth = (idx: number) => {
    const daysInMonth: Y.Array<string> = docData.config.get('daysInMonth');
    if (!daysInMonth) return '1';

    return daysInMonth.get(idx);
  };
  const onLeapInMonthChange = (idx: number, value: string) => {
    if (!value) return;

    if (!docData.config.has('leapInMonth')) {
      docData.config.set('leapInMonth', new Y.Array());
    }
    const leapInMonth: Y.Array<number> = docData.config.get('leapInMonth');

    yDoc.transact(() => {
      const monthsInYear = docData.config.get('monthsInYear') || 1;
      if (leapInMonth.length > monthsInYear) {
        leapInMonth.delete(monthsInYear - 1, leapInMonth.length - monthsInYear);
      }
      if (leapInMonth.length < monthsInYear) {
        leapInMonth.insert(
          leapInMonth.length,
          new Array(monthsInYear - leapInMonth.length).fill(1),
        );
      }

      leapInMonth.delete(idx);
      leapInMonth.insert(idx, [parseInt(value)]);
    });
  };
  const getLeapInMonth = (idx: number) => {
    const leapInMonth: Y.Array<string> = docData.config.get('leapInMonth');
    if (!leapInMonth) return '0';

    return leapInMonth.get(idx);
  };
  const onDayOfWeekNameChange = (idx: number, value: string) => {
    if (!docData.config.has('dayOfWeekNames')) {
      docData.config.set('dayOfWeekNames', new Y.Array());
    }
    const dayOfWeekNames: Y.Array<string> =
      docData.config.get('dayOfWeekNames');

    yDoc.transact(() => {
      const daysInWeek = docData.config.get('daysInWeek') || 1;
      if (dayOfWeekNames.length > daysInWeek) {
        dayOfWeekNames.delete(
          daysInWeek - 1,
          dayOfWeekNames.length - daysInWeek,
        );
      }
      if (dayOfWeekNames.length < daysInWeek) {
        dayOfWeekNames.insert(
          dayOfWeekNames.length,
          new Array(daysInWeek - dayOfWeekNames.length).fill(''),
        );
      }

      dayOfWeekNames.delete(idx);
      dayOfWeekNames.insert(idx, [value]);
    });
  };
  const getDayOfWeekName = (idx: number) => {
    const dayOfWeekNames: Y.Array<string> =
      docData.config.get('dayOfWeekNames');
    if (!dayOfWeekNames) return '';

    return dayOfWeekNames.get(idx);
  };

  return (
    <IonCard>
      <IonList>
        <IonItem>
          <IonInput
            labelPlacement="stacked"
            label={'Days in year'}
            onIonInput={(event) =>
              onDaysInYearChange(event.detail.value || '0')
            }
            debounce={200}
            value={docData.config.get('daysInYear') || ''}
          />
        </IonItem>
        <IonItem>
          <IonInput
            labelPlacement="stacked"
            label={'Months in year'}
            onIonInput={(event) =>
              onMonthsInYearChange(event.detail.value || '0')
            }
            debounce={200}
            value={docData.config.get('monthsInYear') || ''}
          />
        </IonItem>
        <IonGrid>
          {new Array(
            Math.min(
              docData.config.get('monthsInYear') || 1,
              MAX_MONTHS_IN_YEAR,
            ),
          )
            .fill(0)
            .map((_, idx) => (
              <IonRow key={idx}>
                <IonCol size="6">
                  <IonItem>
                    <IonInput
                      labelPlacement="stacked"
                      label={`Name for month ${idx + 1}`}
                      onIonInput={(event) =>
                        onMonthNameChange(idx, event.detail.value || '')
                      }
                      debounce={200}
                      value={getMonthName(idx)}
                    />
                  </IonItem>
                </IonCol>
                <IonCol size="3">
                  <IonItem key={idx}>
                    <IonInput
                      labelPlacement="stacked"
                      label={`Days`}
                      onIonInput={(event) =>
                        onDaysInMonthChange(idx, event.detail.value || '')
                      }
                      debounce={200}
                      value={getDaysInMonth(idx)}
                    />
                  </IonItem>
                </IonCol>
                <IonCol size="3">
                  <IonItem key={idx}>
                    <IonInput
                      labelPlacement="stacked"
                      label={`Leap/Y`}
                      onIonInput={(event) =>
                        onLeapInMonthChange(idx, event.detail.value || '')
                      }
                      debounce={200}
                      value={getLeapInMonth(idx)}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            ))}
        </IonGrid>
        <IonItem>
          <IonInput
            labelPlacement="stacked"
            label={'Days in week'}
            onIonInput={(event) =>
              onDaysInWeekChange(event.detail.value || '0')
            }
            debounce={200}
            value={docData.config.get('daysInWeek') || ''}
          />
        </IonItem>
        {new Array(
          Math.min(docData.config.get('daysInWeek') || 1, MAX_DAYS_IN_WEEK),
        )
          .fill(0)
          .map((_, idx) => (
            <IonItem key={idx}>
              <IonInput
                labelPlacement="stacked"
                label={`Name for day of week ${idx + 1}`}
                onIonInput={(event) =>
                  onDayOfWeekNameChange(idx, event.detail.value || '')
                }
                debounce={200}
                value={getDayOfWeekName(idx)}
              />
            </IonItem>
          ))}
      </IonList>

      <br />
      <br />

      <CalendarRenderer docData={docData} />
    </IonCard>
  );
};
