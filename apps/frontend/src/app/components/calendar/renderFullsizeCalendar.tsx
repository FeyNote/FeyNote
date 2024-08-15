import type { ArtifactDTO } from '@feynote/prisma/types';
import { IonButton, IonIcon } from '@ionic/react';
import styled from 'styled-components';
import type { CalendarRenderArgs } from './CalendarRenderArgs';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { routes } from '../../routes';

const CalendarContainer = styled.div``;

const CalendarBodyContainer = styled.div`
  overflow-x: auto;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
`;

const CalendarBody = styled.div`
  min-width: 650px;
  max-width: 900px;
`;

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
  flex-basis: 100%;
  overflow: hidden;
  text-wrap: nowrap;
  text-align: center;
`;

const CalendarWeek = styled.div`
  display: flex;
`;

const CalendarDayContainer = styled.div`
  flex-basis: 100%;
  border: 1px solid gray;
`;

const CalendarDay = styled.div`
  padding: 4px;
  min-height: 120px;
`;

const CalendarItem = styled.div`
  font-size: 0.8rem;
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
      <CalendarDay>
        <div>{dayInfo.day}</div>

        {references.map((reference) => (
          <CalendarItem>
            <Link
              key={reference.id}
              to={routes.artifact.build({
                id: reference.artifactId,
              })}
            >
              {reference.artifact.title}
            </Link>
          </CalendarItem>
        ))}
      </CalendarDay>
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
        {args.monthNames.get(args.centerMonth - 1)} {args.centerYear}
      </MonthYearName>
      <NextBackButton fill="clear" onClick={() => args.moveCenter(1)}>
        <IonIcon aria-hidden="true" slot="icon-only" icon={chevronForward} />
      </NextBackButton>
    </MonthSwitcher>
  );

  return (
    <CalendarContainer>
      {showSwitcher && switcher}
      <CalendarBodyContainer>
        <CalendarBody>
          <DayTitlesContainer>
            {new Array(args.daysInWeek || 1).fill(0).map((_, dayIdx) => (
              <DayTitle key={dayIdx}>
                {args.dayOfWeekNames.get(dayIdx)}
              </DayTitle>
            ))}
          </DayTitlesContainer>
          {new Array(args.weekCount || 1).fill(0).map((_, weekIdx) => (
            <CalendarWeek key={weekIdx}>
              {new Array(args.daysInWeek || 1).fill(0).map((_, dayIdx) => (
                <CalendarDayContainer key={`${weekIdx}.${dayIdx}`}>
                  {renderDay(weekIdx, dayIdx)}
                </CalendarDayContainer>
              ))}
            </CalendarWeek>
          ))}
        </CalendarBody>
      </CalendarBodyContainer>
    </CalendarContainer>
  );
};
