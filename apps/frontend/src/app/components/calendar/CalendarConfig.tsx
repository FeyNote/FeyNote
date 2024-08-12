import { Doc as YDoc } from 'yjs';
import { Array as YArray } from 'yjs';
import {
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonList,
  IonRow,
} from '@ionic/react';
import type { TypedMap } from 'yjs-types';
import type { YCalendarConfig } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';

/**
 * Must be bounded since this can cause major performance issues
 */
const MAX_MONTHS_IN_YEAR = 24;

/**
 * Must be bounded since this can cause major performance issues
 */
const MAX_DAYS_IN_MONTH = 60;

/**
 * Bounded for sanity, we could probably remove this
 */
const MAX_LEAP = 10;

/**
 * Must be bounded since this can cause major performance issues
 */
const MAX_DAYS_IN_WEEK = 14;

interface Props {
  yDoc: YDoc;
  configMap: TypedMap<Partial<YCalendarConfig>>;
}

export const CalendarConfig: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const onDaysInWeekChange = (value: string) => {
    if (!value.length) return;

    props.configMap.set(
      'daysInWeek',
      Math.min(parseInt(value), MAX_DAYS_IN_WEEK),
    );
  };

  const onMonthsInYearChange = (value: string) => {
    if (!value.length) return;

    props.configMap.set(
      'monthsInYear',
      Math.min(parseInt(value), MAX_MONTHS_IN_YEAR),
    );
  };
  const onMonthNameChange = (idx: number, value: string) => {
    if (!props.configMap.has('monthNames')) {
      props.configMap.set('monthNames', new YArray<string>());
    }
    let monthNames = props.configMap.get('monthNames');

    props.yDoc.transact(() => {
      if (!monthNames) {
        monthNames = new YArray();
        props.configMap.set('monthNames', monthNames);
      }
      const monthsInYear = props.configMap.get('monthsInYear') || 1;
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
    const monthNames = props.configMap.get('monthNames');
    if (!monthNames) return '';

    return monthNames.get(idx);
  };
  const onDaysInMonthChange = (idx: number, value: string) => {
    if (!value) return;

    if (!props.configMap.has('daysInMonth')) {
      props.configMap.set('daysInMonth', new YArray());
    }
    let daysInMonth = props.configMap.get('daysInMonth');

    props.yDoc.transact(() => {
      if (!daysInMonth) {
        daysInMonth = new YArray();
        props.configMap.set('daysInMonth', daysInMonth);
      }
      const monthsInYear = props.configMap.get('monthsInYear') || 1;
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
    const daysInMonth = props.configMap.get('daysInMonth');
    if (!daysInMonth) return '1';

    return daysInMonth.get(idx);
  };
  const onLeapInMonthChange = (idx: number, value: string) => {
    if (!value) return;

    if (!props.configMap.has('leapInMonth')) {
      props.configMap.set('leapInMonth', new YArray());
    }
    let leapInMonth = props.configMap.get('leapInMonth');

    props.yDoc.transact(() => {
      if (!leapInMonth) {
        leapInMonth = new YArray();
        props.configMap.set('leapInMonth', leapInMonth);
      }
      const monthsInYear = props.configMap.get('monthsInYear') || 1;
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
    const leapInMonth = props.configMap.get('leapInMonth');
    if (!leapInMonth) return '0';

    return leapInMonth.get(idx);
  };
  const onDayOfWeekNameChange = (idx: number, value: string) => {
    if (!props.configMap.has('dayOfWeekNames')) {
      props.configMap.set('dayOfWeekNames', new YArray());
    }
    let dayOfWeekNames = props.configMap.get('dayOfWeekNames');

    props.yDoc.transact(() => {
      if (!dayOfWeekNames) {
        dayOfWeekNames = new YArray();
        props.configMap.set('dayOfWeekNames', dayOfWeekNames);
      }
      const daysInWeek = props.configMap.get('daysInWeek') || 1;
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
    const dayOfWeekNames = props.configMap.get('dayOfWeekNames');
    if (!dayOfWeekNames) return '';

    return dayOfWeekNames.get(idx);
  };

  return (
    <IonList>
      <IonItem>
        <IonInput
          labelPlacement="stacked"
          label={t('calendar.monthsInYear')}
          onIonInput={(event) =>
            onMonthsInYearChange(event.detail.value || '0')
          }
          min={1}
          max={MAX_MONTHS_IN_YEAR}
          type="number"
          debounce={200}
          value={props.configMap.get('monthsInYear') || ''}
        />
      </IonItem>
      <IonGrid>
        {new Array(
          Math.min(
            props.configMap.get('monthsInYear') || 1,
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
                    label={t('calendar.nameForMonth', {
                      number: idx + 1,
                    })}
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
                    label={t('calendar.month.days')}
                    onIonInput={(event) =>
                      onDaysInMonthChange(idx, event.detail.value || '')
                    }
                    min={1}
                    max={MAX_DAYS_IN_MONTH}
                    type="number"
                    debounce={200}
                    value={getDaysInMonth(idx)}
                  />
                </IonItem>
              </IonCol>
              <IonCol size="3">
                <IonItem key={idx}>
                  <IonInput
                    labelPlacement="stacked"
                    label={t('calendar.month.leap')}
                    min={0}
                    max={MAX_LEAP}
                    type="number"
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
          label={t('calendar.daysInWeek')}
          onIonInput={(event) => onDaysInWeekChange(event.detail.value || '0')}
          min={1}
          max={MAX_DAYS_IN_WEEK}
          type="number"
          debounce={200}
          value={props.configMap.get('daysInWeek') || ''}
        />
      </IonItem>
      {new Array(
        Math.min(props.configMap.get('daysInWeek') || 1, MAX_DAYS_IN_WEEK),
      )
        .fill(0)
        .map((_, idx) => (
          <IonItem key={idx}>
            <IonInput
              labelPlacement="stacked"
              label={t('calendar.nameForDay', {
                number: idx + 1,
              })}
              onIonInput={(event) =>
                onDayOfWeekNameChange(idx, event.detail.value || '')
              }
              debounce={200}
              value={getDayOfWeekName(idx)}
            />
          </IonItem>
        ))}
    </IonList>
  );
};
