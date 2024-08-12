import type { ArtifactDTO } from '@feynote/prisma/types';
import { IonButton } from '@ionic/react';
import styled from 'styled-components';
import type { CalendarRenderArgs } from './CalendarRenderArgs';

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

interface FullsizeCalendarArgs extends CalendarRenderArgs {
  knownReferencesByDay: Record<
    string,
    ArtifactDTO['incomingArtifactReferences']
  >;
}

export const renderFullsizeCalendar = (args: FullsizeCalendarArgs) => {
  const renderDay = (weekIdx: number, dayIdx: number) => {
    const dayInfo = args.getDayInfo(weekIdx, dayIdx);
    if (!dayInfo) return <></>;

    const references = args.knownReferencesByDay[dayInfo.datestamp] || [];

    return (
      <>
        <div>{dayInfo.day}</div>

        {references.map((reference) => (
          <div key={reference.id}>{reference.artifact.title}</div>
        ))}
      </>
    );
  };

  return (
    <CalendarBody>
      <MonthSwitcher>
        <IonButton onClick={() => args.moveCenter(-1)}>&lt;</IonButton>
        {args.centerYear} {args.monthNames.get(args.centerMonth - 1)}
        <IonButton onClick={() => args.moveCenter(1)}>&gt;</IonButton>
      </MonthSwitcher>
      <DayTitlesContainer>
        {new Array(args.daysInWeek || 1).fill(0).map((_, dayIdx) => (
          <DayTitle key={dayIdx}>{args.dayOfWeekNames.get(dayIdx)}</DayTitle>
        ))}
      </DayTitlesContainer>
      {new Array(args.weekCount || 1).fill(0).map((_, weekIdx) => (
        <CalendarWeek key={weekIdx}>
          {new Array(args.daysInWeek || 1).fill(0).map((_, dayIdx) => (
            <CalendarDay key={`${weekIdx}.${dayIdx}`}>
              {renderDay(weekIdx, dayIdx)}
            </CalendarDay>
          ))}
        </CalendarWeek>
      ))}
    </CalendarBody>
  );
};
