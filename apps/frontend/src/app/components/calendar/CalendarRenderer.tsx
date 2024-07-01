import styled from 'styled-components';
import { DocData } from './ArtifactCalendar';
import { useMemo, useState } from 'react';
import * as Y from 'yjs';

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
  const calendarStartDayOfWeek: number = docData.config.get(
    'calendarStartDayOfWeek',
  );
  const daysInWeek: number = docData.config.get('daysInWeek');
  const daysInMonthList: Y.Array<number> = docData.config.get('daysInMonth');
  const leapInMonthList: Y.Array<number> = docData.config.get('leapInMonth');
  let year = 0;
  let month = 0;
  let dayOfWeek = calendarStartDayOfWeek;

  while (year < findYear && month < findMonth) {
    const daysInMonth = daysInMonthList.get(month);
    const leapInMonth = leapInMonthList.get(month);
    const leap = leapInMonth && year % leapInMonth === 0 ? 1 : 0;
    const remainderDays = ((daysInMonth + leap) % daysInWeek) - 1;

    dayOfWeek = (dayOfWeek + (remainderDays % daysInWeek)) % daysInWeek;
    year++;
    month++;
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
  const daysInWeek: number = props.docData.config.get('daysInWeek');
  const daysInMonth: number = props.docData.config
    .get('daysInMonth')
    .get(centerMonth - 1);
  console.log(centerMonth);
  const firstWeekNumDays = daysInWeek - startDayOfMonth;
  const weekCount =
    1 + Math.ceil((daysInMonth - firstWeekNumDays) / daysInWeek);

  return (
    <CalendarBody>
      <MonthSwitcher>
        &lt; {centerYear} {centerMonth} &gt;
      </MonthSwitcher>
      <DayTitlesContainer>
        {new Array(daysInWeek).fill(0).map((_, dayIdx) => (
          <DayTitle>{dayOfWeekNames.get(dayIdx) as any}</DayTitle>
        ))}
      </DayTitlesContainer>
      {new Array(weekCount).fill(0).map((_, weekIdx) => (
        <CalendarWeek key={weekIdx}>
          {new Array(daysInWeek).fill(0).map((_, dayIdx) => (
            <CalendarDay>
              {(() => {
                const num =
                  -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));

                if (num < 1) return '';
                if (num > daysInMonth) return '';
                return -startDayOfMonth + (weekIdx * daysInWeek + (dayIdx + 1));
              })()}
            </CalendarDay>
          ))}
        </CalendarWeek>
      ))}
    </CalendarBody>
  );
};
