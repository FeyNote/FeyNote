import styled from 'styled-components';
import { useMemo, useState } from 'react';
import { Array as YArray } from 'yjs';
import { IonButton } from '@ionic/react';
import type { TypedArray, TypedMap } from 'yjs-types';
import type { ArtifactDTO } from '@feynote/prisma/types';
import type { YCalendarConfig } from '@feynote/shared-utils';

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

const startDayOfWeekForMonth = (
  configMap: TypedMap<Partial<YCalendarConfig>>,
  findYear: number,
  findMonth: number,
): number => {
  if (findYear < 0 || findMonth < 0) throw new Error();
  const calendarStartDayOfWeek = configMap.get('calendarStartDayOfWeek') || 0;
  const daysInWeek = configMap.get('daysInWeek') || 1;
  const monthsInYear = configMap.get('monthsInYear') || 1;
  const daysInMonthList = configMap.get('daysInMonth') || new YArray();
  const leapInMonthList = configMap.get('leapInMonth') || new YArray();

  let dayOfWeek = calendarStartDayOfWeek;
  if (findYear === 0 && findMonth === 0) return calendarStartDayOfWeek;

  let year = 1;
  let lastMonthYear = 0;
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
      leapInLastMonth && lastMonthYear && lastMonthYear % leapInLastMonth === 0
        ? 1
        : 0;
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

    if (year >= findYear && month >= findMonth - 1) {
      break;
    }

    lastMonth = month;
    lastMonthYear = year;
    month++;
    if (month >= monthsInYear) {
      month = 0;
      year++;
    }
  }

  return dayOfWeek;
};

type IncomingArtifactReference = ArtifactDTO['incomingArtifactReferences'][0];

interface Props {
  configMap: TypedMap<Partial<YCalendarConfig>>;
  incomingArtifactReferences: IncomingArtifactReference[];
}

export const CalendarRenderer: React.FC<Props> = (props) => {
  const [center, setCenter] = useState<string>(
    props.configMap.get('center') ||
      `${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate().toFixed()}`,
  );
  const centerParts = center.split('.');
  const centerYear = parseInt(centerParts[0]);
  const centerMonth = parseInt(centerParts[1]);
  const centerDay = parseInt(centerParts[1]);

  const knownReferencesByDay = useMemo(
    () =>
      props.incomingArtifactReferences.reduce<
        Record<string, IncomingArtifactReference[]>
      >((knownReferencesByDay, incomingReference) => {
        if (!incomingReference.targetArtifactBlockId)
          return knownReferencesByDay;

        const blockId = incomingReference.targetArtifactBlockId;
        if (blockId.includes('-')) {
          const [start, end] = blockId.split('-');
          // TODO: add support for date ranges
        } else {
          knownReferencesByDay[blockId] ||= [];
          knownReferencesByDay[blockId].push(incomingReference);
        }

        return knownReferencesByDay;
      }, {}),
    [props.incomingArtifactReferences],
  );

  const startDayOfMonth = useMemo(() => {
    return startDayOfWeekForMonth(props.configMap, centerYear, centerMonth);
  }, [centerYear, centerMonth]); // TODO: Missing deps here

  const dayOfWeekNames =
    props.configMap.get('dayOfWeekNames') ||
    (new YArray() as TypedArray<string>);
  const monthNames =
    props.configMap.get('monthNames') || (new YArray() as TypedArray<string>);
  const daysInWeek = props.configMap.get('daysInWeek') || 1;
  const daysInMonth =
    props.configMap.get('daysInMonth')?.get(centerMonth - 1) || 1;
  const leapInMonth =
    props.configMap.get('leapInMonth')?.get(centerMonth - 1) || 0;
  const monthsInYear = props.configMap.get('monthsInYear') || 1;
  const firstWeekNumDays = daysInWeek - startDayOfMonth;
  const weekCount =
    1 + Math.ceil((daysInMonth - firstWeekNumDays) / daysInWeek);

  const moveCenter = (dir: number): void => {
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

  const getDayNumber = (
    weekIdx: number,
    dayIdx: number,
  ): number | undefined => {
    const num = -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));

    const leapDays = centerYear % leapInMonth === 0 ? 1 : 0;

    if (num < 1) return undefined;
    if (num > daysInMonth + leapDays) return undefined;
    return -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));
  };

  const renderDay = (weekIdx: number, dayIdx: number): JSX.Element => {
    const dayNumber = getDayNumber(weekIdx, dayIdx);
    if (!dayNumber) return <></>;

    const references =
      knownReferencesByDay[`${centerYear}.${centerMonth}.${centerDay}`] || [];

    return (
      <>
        <div>{dayNumber}</div>

        {references.map((reference) => (
          <div>{reference.artifact.title}</div>
        ))}
      </>
    );
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
          <DayTitle key={dayIdx}>{dayOfWeekNames.get(dayIdx)}</DayTitle>
        ))}
      </DayTitlesContainer>
      {new Array(weekCount || 1).fill(0).map((_, weekIdx) => (
        <CalendarWeek key={weekIdx}>
          {new Array(daysInWeek || 1).fill(0).map((_, dayIdx) => (
            <CalendarDay key={`${weekIdx}.${dayIdx}`}>
              {renderDay(weekIdx, dayIdx)}
            </CalendarDay>
          ))}
        </CalendarWeek>
      ))}
    </CalendarBody>
  );
};
