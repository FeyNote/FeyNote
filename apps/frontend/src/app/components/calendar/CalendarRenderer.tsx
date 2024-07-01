import styled from 'styled-components';
import { DocData } from './ArtifactCalendar';
import { useMemo, useState } from 'react';
import * as Y from 'yjs';
import { IonButton } from '@ionic/react';

const CalendarBody = styled.div``;

const MonthSwitcher = styled.div``;

const DayTitlesContainer = styled.div`
  display: flex;
`;

const DayTitle = styled.div`
  width: 75px;
  overflow: hidden;
  text-wrap: nowrap;
`;

const CalendarWeek = styled.div`
  display: flex;
`;

const CalendarDay = styled.div`
  border: 1px solid gray;
  width: 75px;
  height: 75px;
`;

interface Props {
  docData: DocData;
}

const startDayOfWeekForMonth = (
  docData: DocData,
  findYear: number,
  findMonth: number,
) => {
  if (findYear < 0 || findMonth < 0) throw new Error();
  const calendarStartDayOfWeek: number = docData.config.get(
    'calendarStartDayOfWeek',
  );
  const daysInWeek: number = docData.config.get('daysInWeek');
  const monthsInYear: number = docData.config.get('monthsInYear');
  const daysInMonthList: Y.Array<number> = docData.config.get('daysInMonth');
  const leapInMonthList: Y.Array<number> = docData.config.get('leapInMonth');

  let dayOfWeek = calendarStartDayOfWeek;
  if (findYear === 0 && findMonth === 0) return calendarStartDayOfWeek;

  let year = 1;
  let lastYear = 0;
  let month = 1;
  let lastMonth = 0;
  if (month >= monthsInYear) {
    month = 0;
    year++;
  }

  while (year <= findYear) {
    const daysInLastMonth = daysInMonthList.get(lastMonth);
    const leapInLastMonth = leapInMonthList.get(lastMonth);

    // Must avoid year 0 being considered as leap year!
    const leapDays =
      leapInLastMonth && lastYear && lastYear % leapInLastMonth === 0 ? 1 : 0;
    /**
     * The difference between last month's dayOfWeek and this month's dayOfWeek
     */
    const dayOfWeekDiff = (daysInLastMonth + leapDays) % daysInWeek;

    dayOfWeek = dayOfWeek + dayOfWeekDiff;
    if (dayOfWeek < 0) {
      dayOfWeek = daysInWeek + dayOfWeek;
    }
    if (dayOfWeek > daysInWeek - 1) {
      dayOfWeek = dayOfWeek - daysInWeek;
    }

    // dayOfWeek = (dayOfWeek + (remainderDays % daysInWeek)) % daysInWeek;

    if (year >= findYear && month >= findMonth - 1) {
      break;
    }

    lastMonth = month;
    month++;
    if (month >= monthsInYear) {
      month = 0;
      lastYear = year;
      year++;
    }
  }

  return dayOfWeek;
};

export const CalendarRenderer: React.FC<Props> = (props) => {
  const [center, setCenter] = useState<string>(
    props.docData.config.get('center') ||
      `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate().toFixed()}`,
  );
  const centerParts = center.split('.');
  const centerYear = parseInt(centerParts[0]);
  const centerMonth = parseInt(centerParts[1]);
  const centerDay = parseInt(centerParts[1]);

  const startDayOfMonth = useMemo(() => {
    return startDayOfWeekForMonth(props.docData, centerYear, centerMonth);
  }, [centerYear, centerMonth]); // TODO: Missing deps here

  const dayOfWeekNames: Y.Array<string> =
    props.docData.config.get('dayOfWeekNames');
  const monthNames: Y.Array<string> = props.docData.config.get('monthNames');
  const daysInWeek: number = props.docData.config.get('daysInWeek');
  const daysInMonth: number = props.docData.config
    .get('daysInMonth')
    .get(centerMonth - 1);
  const leapInMonth: number = props.docData.config
    .get('leapInMonth')
    .get(centerMonth - 1);
  const monthsInYear: number = props.docData.config.get('monthsInYear');
  const firstWeekNumDays = daysInWeek - startDayOfMonth;
  const weekCount =
    1 + Math.ceil((daysInMonth - firstWeekNumDays) / daysInWeek);

  const moveCenter = (dir: number) => {
    let newCenterYear = centerYear;
    let newCenterMonth = centerMonth + dir;

    if (newCenterMonth < 1) {
      newCenterMonth = monthsInYear;
      newCenterYear--;
    }
    if (newCenterMonth > monthsInYear) {
      newCenterMonth = 1;
      newCenterYear++;
    }

    setCenter(`${newCenterYear}.${newCenterMonth}.${centerDay}`);
  };

  return (
    <CalendarBody>
      <MonthSwitcher>
        <IonButton onClick={() => moveCenter(-1)}>&lt;</IonButton>
        {centerYear} {monthNames.get(centerMonth - 1)}
        <IonButton onClick={() => moveCenter(1)}>&gt;</IonButton>
      </MonthSwitcher>
      <DayTitlesContainer>
        {new Array(daysInWeek || 1).fill(0).map((_, dayIdx) => (
          <DayTitle>{dayOfWeekNames.get(dayIdx) as any}</DayTitle>
        ))}
      </DayTitlesContainer>
      {new Array(weekCount || 1).fill(0).map((_, weekIdx) => (
        <CalendarWeek key={weekIdx}>
          {new Array(daysInWeek || 1).fill(0).map((_, dayIdx) => (
            <CalendarDay>
              {(() => {
                const num =
                  -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));

                const leapDays = centerYear % leapInMonth === 0 ? 1 : 0;

                if (num < 1) return '';
                if (num > daysInMonth + leapDays) return '';
                return -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));
              })()}
            </CalendarDay>
          ))}
        </CalendarWeek>
      ))}
    </CalendarBody>
  );
};
