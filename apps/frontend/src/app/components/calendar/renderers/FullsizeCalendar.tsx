import type { ArtifactDTO } from '@feynote/prisma/types';
import { IonButton, IonIcon } from '@ionic/react';
import styled from 'styled-components';
import type { CalendarRenderProps } from './CalendarRenderProps';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { useContext } from 'react';
import { PaneContext } from '../../../context/pane/PaneContext';
import { Artifact } from '../../artifact/Artifact';
import { PaneTransition } from '../../../context/paneControl/PaneControlContext';

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

interface FullsizeCalendarProps extends CalendarRenderProps {
  knownReferencesByDay: Record<
    string,
    ArtifactDTO['incomingArtifactReferences']
  >;
}

export const FullsizeCalendar: React.FC<FullsizeCalendarProps> = (props) => {
  const { navigate } = useContext(PaneContext);

  const renderDay = (weekIdx: number, dayIdx: number) => {
    const dayInfo = props.getDayInfo(weekIdx, dayIdx);
    if (!dayInfo) return <></>;

    const references = props.knownReferencesByDay[dayInfo.datestamp] || [];

    return (
      <CalendarDay data-date={dayInfo.datestamp}>
        <div>{dayInfo.day}</div>

        {references.map((reference) => (
          <CalendarItem key={reference.id}>
            <a
              key={reference.id}
              href=""
              onClick={() =>
                navigate(
                  <Artifact id={reference.artifactId} />,
                  PaneTransition.Push,
                )
              }
            >
              {reference.artifact.title}
            </a>
          </CalendarItem>
        ))}
      </CalendarDay>
    );
  };

  // For session calendars we don't want to show the pagination switcher since it doesn't make sense.
  // To allow users to have this behavior themselves, we don't show the switcher when their calendar has the following config:
  const showSwitcher = props.monthNames.length !== 1 || props.centerYear !== 1;
  const switcher = (
    <MonthSwitcher>
      <NextBackButton fill="clear" onClick={() => props.moveCenter(-1)}>
        <IonIcon aria-hidden="true" slot="icon-only" icon={chevronBack} />
      </NextBackButton>
      <MonthYearName>
        {props.monthNames.get(props.centerMonth - 1)} {props.centerYear}
      </MonthYearName>
      <NextBackButton fill="clear" onClick={() => props.moveCenter(1)}>
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
            {new Array(props.daysInWeek || 1).fill(0).map((_, dayIdx) => (
              <DayTitle key={dayIdx}>
                {props.dayOfWeekNames.get(dayIdx)}
              </DayTitle>
            ))}
          </DayTitlesContainer>
          {new Array(props.weekCount || 1).fill(0).map((_, weekIdx) => (
            <CalendarWeek key={weekIdx}>
              {new Array(props.daysInWeek || 1).fill(0).map((_, dayIdx) => (
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
