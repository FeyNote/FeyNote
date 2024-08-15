import type { ArtifactDTO } from '@feynote/prisma/types';
import { IonButton, IonIcon } from '@ionic/react';
import styled from 'styled-components';
import type { CalendarRenderArgs } from './CalendarRenderArgs';
import { chevronBack, chevronForward } from 'ionicons/icons';

const CalendarBody = styled.div``;

const MonthSwitcher = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NextBackButton = styled(IonButton)`
  margin-left: 16px;
  margin-right: 16px;
`;

const MonthYearName = styled.div`
  min-width: 150px;
  text-align: center;
`;

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

  // For session calendars we don't want to show the pagination switcher since it doesn't make sense.
  // To allow users to have this behavior themselves, we don't show the switcher when their calendar has the following config:
  const showSwitcher = args.monthNames.length !== 1 || args.centerYear !== 1;
  const switcher = (
    <MonthSwitcher>
      <NextBackButton fill="clear" onClick={() => args.moveCenter(-1)}>
        <IonIcon aria-hidden="true" slot="icon-only" icon={chevronBack} />
      </NextBackButton>
      <MonthYearName>
        {args.centerYear} {args.monthNames.get(args.centerMonth - 1)}
      </MonthYearName>
      <NextBackButton fill="clear" onClick={() => args.moveCenter(1)}>
        <IonIcon aria-hidden="true" slot="icon-only" icon={chevronForward} />
      </NextBackButton>
    </MonthSwitcher>
  );

  return (
    <CalendarBody>
      {showSwitcher && switcher}
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
