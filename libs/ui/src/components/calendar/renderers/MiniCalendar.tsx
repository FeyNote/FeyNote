import { IonButton, IonIcon } from '@ionic/react';
import styled from 'styled-components';
import { chevronBack, chevronForward } from 'ionicons/icons';
import type { CalendarRenderProps } from './CalendarRenderProps';

const CalendarContainer = styled.div``;

const CalendarBodyContainer = styled.div`
  overflow-x: auto;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
`;

const CalendarBody = styled.div`
  max-width: 400px;
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
  font-size: 0.6rem;
`;

const CalendarWeek = styled.div`
  display: flex;
`;

const CalendarDayContainer = styled.div`
  flex-basis: 100%;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  user-select: none;
`;

const CalendarDay = styled.button<{
  $selected: boolean;
}>`
  width: 30px;
  height: 30px;
  border: 1px solid gray;
  background: transparent;
  color: inherit;
  border-radius: 100%;
  cursor: pointer;

  ${(props) =>
    props.$selected
      ? `
    background: var(--ion-color-primary);
    border: 1px solid var(--ion-color-primary);
    color: white;
  `
      : ''}

  &:hover {
    background: rgba(var(--ion-background-color-rgb, rgb(255, 255, 255)), 0.5);

    ${(props) =>
      props.$selected
        ? `
      background: var(--ion-color-primary);
    `
        : ''}
  }
`;

export const MiniCalendar: React.FC<CalendarRenderProps> = (props) => {
  const renderDay = (weekIdx: number, dayIdx: number) => {
    const dayInfo = props.getDayInfo(weekIdx, dayIdx);
    if (!dayInfo) return null;

    return (
      <CalendarDay
        data-date={dayInfo.datestamp}
        $selected={dayInfo.datestamp === props.selectedDate}
        onClick={() => props.onDayClicked?.(dayInfo.datestamp)}
      >
        <div>{dayInfo.day}</div>
      </CalendarDay>
    );
  };

  // For session calendars we don't want to show the pagination switcher since it doesn't make sense.
  // To allow users to have this behavior themselves, we don't show the switcher when their calendar has the following config:
  const showSwitcher = props.monthNames.length !== 1 || props.centerYear !== 1;
  const switcher = (
    <MonthSwitcher>
      <NextBackButton
        size="small"
        fill="clear"
        onClick={() => props.moveCenter(-1)}
      >
        <IonIcon aria-hidden="true" slot="icon-only" icon={chevronBack} />
      </NextBackButton>
      <MonthYearName>
        {props.monthNames.get(props.centerMonth - 1)} {props.centerYear}
      </MonthYearName>
      <NextBackButton
        size="small"
        fill="clear"
        onClick={() => props.moveCenter(1)}
      >
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
