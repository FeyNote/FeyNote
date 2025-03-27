import type { YCalendarConfig } from '@feynote/shared-utils';
import { IonButton, IonIcon, IonInput } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import type { TypedMap } from 'yjs-types';
import { calendar, checkmark } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { ArtifactCalendar } from './ArtifactCalendar';
import { Doc as YDoc } from 'yjs';
import { specifierToDatestamp } from './specifierToDatestamp';
import { isSessionCalendar } from './isSessionCalendar';
import styled from 'styled-components';

const CalendarSelectDateGrid = styled.div`
  display: grid;
  grid-template-rows: 340px 1fr;
`;

const ArtifactCalendarContainer = styled.div`
  overflow-y: auto;
`;

interface Props {
  yDoc: YDoc;
  configMap: TypedMap<Partial<YCalendarConfig>>;
  onSubmit: (date: string) => void;
}

export const CalendarSelectDateInput: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLIonInputElement>(null);
  const setCenterRef = useRef<(center: string) => void>(undefined);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const isValid = !!specifierToDatestamp(text);

  const submit = () => {
    if (!isValid) return;
    props.onSubmit(text);
  };

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    submit();
  };

  const onIonInput = (value: string) => {
    if (value && isSessionCalendar(props.configMap) && !value.startsWith('#')) {
      value = `#${value}`;
    }

    setText(value);

    const datestamp = specifierToDatestamp(value);
    if (datestamp) {
      const dayEl = calendarContainerRef.current?.querySelector(
        `[data-date="${datestamp}"]`,
      );

      console.log(dayEl);
      dayEl?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.setFocus();
    });
  }, []);

  useEffect(() => {
    const datestamp = specifierToDatestamp(text);
    if (!datestamp) return;

    setCenterRef.current?.(datestamp);
  }, [text]);

  const inputPlaceholderI18n = isSessionCalendar(props.configMap)
    ? 'calendar.selectDate.placeholder.session'
    : 'calendar.selectDate.placeholder.gregorian';

  return (
    <CalendarSelectDateGrid>
      <ArtifactCalendarContainer ref={calendarContainerRef}>
        <ArtifactCalendar
          artifactId={undefined}
          y={props.yDoc}
          editable={false}
          viewType="mini"
          setCenterRef={setCenterRef}
          selectedDate={specifierToDatestamp(text)}
          onDayClicked={(datestamp: string) => setText(datestamp)}
        />
      </ArtifactCalendarContainer>
      <IonInput
        className="ion-padding-start ion-padding-end"
        label={t('calendar.selectDate.label')}
        labelPlacement="stacked"
        placeholder={t(inputPlaceholderI18n)}
        ref={inputRef}
        onKeyUp={keyUpHandler}
        onIonInput={(e) => onIonInput(e.detail.value || '')}
        value={text}
      >
        <IonIcon slot="start" icon={calendar} aria-hidden="true"></IonIcon>
        <IonButton
          disabled={!isValid}
          fill="clear"
          slot="end"
          aria-label={t('calendar.selectDate.submit')}
          onClick={submit}
        >
          <IonIcon
            slot="icon-only"
            icon={checkmark}
            aria-hidden="true"
          ></IonIcon>
        </IonButton>
      </IonInput>
    </CalendarSelectDateGrid>
  );
};
