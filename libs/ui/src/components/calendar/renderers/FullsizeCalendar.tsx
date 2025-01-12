import { IonButton, IonIcon } from '@ionic/react';
import styled from 'styled-components';
import type { CalendarRenderProps } from './CalendarRenderProps';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { useContext } from 'react';
import { PaneContext } from '../../../context/pane/PaneContext';
import { PaneTransition } from '../../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { Edge } from '@feynote/shared-utils';

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
  margin-left: auto;
  margin-right: auto;
`;

const MonthSwitcher = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NextBackButton = styled(IonButton)`
  margin-left: 16px;
  margin-right: 16px;

  color: var(--editor-button-color);
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

  border-left: 1px solid var(--day-border-color);
  border-right: 1px solid var(--day-border-color);
  border-bottom: 1px solid var(--day-border-color);

  &:first-child {
    border-top: 1px solid var(--day-border-color);
  }
`;

const CalendarDayContainer = styled.div`
  flex-basis: 100%;
  border-right: 1px solid var(--day-border-color);

  &:last-child {
    border-right: none;
  }
`;

const CalendarDay = styled.div`
  padding: 4px;
  min-height: 120px;
`;

const CalendarItem = styled.div`
  font-size: 0.8rem;
`;

const CalendarItemLink = styled.a`
  cursor: pointer;
`;

interface FullsizeCalendarProps extends CalendarRenderProps {
  edgesByDay: Record<string, Edge[]>;
}

export const FullsizeCalendar: React.FC<FullsizeCalendarProps> = (props) => {
  const { navigate } = useContext(PaneContext);

  const renderDay = (weekIdx: number, dayIdx: number) => {
    const dayInfo = props.getDayInfo(weekIdx, dayIdx);
    if (!dayInfo) return null;

    const edges = props.edgesByDay[dayInfo.datestamp] || [];

    return (
      <CalendarDay data-date={dayInfo.datestamp}>
        <div>{dayInfo.day}</div>

        {edges.map((edge) => (
          <CalendarItem key={edge.id}>
            <CalendarItemLink
              key={edge.id}
              onClick={(event) => (
                event.preventDefault(),
                event.stopPropagation(),
                navigate(
                  PaneableComponent.Artifact,
                  { id: edge.artifactId },
                  event.metaKey || event.ctrlKey
                    ? PaneTransition.NewTab
                    : PaneTransition.Push,
                  !(event.metaKey || event.ctrlKey),
                )
              )}
            >
              {edge.artifactTitle}
            </CalendarItemLink>
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
          <div>
            {new Array(props.weekCount || 1).fill(0).map((_, weekIdx) => (
              <CalendarWeek key={weekIdx}>
                {new Array(props.daysInWeek || 1).fill(0).map((_, dayIdx) => (
                  <CalendarDayContainer key={`${weekIdx}.${dayIdx}`}>
                    {renderDay(weekIdx, dayIdx)}
                  </CalendarDayContainer>
                ))}
              </CalendarWeek>
            ))}
          </div>
        </CalendarBody>
      </CalendarBodyContainer>
    </CalendarContainer>
  );
};
