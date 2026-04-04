import type { YCalendarConfig } from '@feynote/shared-utils';
import { IconButton, TextField } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import type { TypedMap } from 'yjs-types';
import { IoCalendar, FaCheck } from '../AppIcons';
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
  padding-top: 8px;
  padding-left: 8px;
`;

const InputContainer = styled.div`
  padding: 8px 12px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  margin-bottom: 4px;
`;

interface Props {
  yDoc: YDoc;
  configMap: TypedMap<Partial<YCalendarConfig>>;
  onSubmit: (date: string) => void;
}

export const CalendarSelectDateInput: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const setCenterRef = useRef<(center: string) => void>(undefined);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const isValid = !!specifierToDatestamp(text);

  const submit = () => {
    if (!isValid) return;
    props.onSubmit(text);
  };

  const keyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    submit();
  };

  const onInputChange = (value: string) => {
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
      inputRef.current?.focus();
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
      <InputContainer>
        <InputLabel>{t('calendar.selectDate.label')}</InputLabel>
        <TextField.Root
          ref={inputRef}
          placeholder={t(inputPlaceholderI18n)}
          onKeyUp={keyUpHandler}
          onChange={(e) => onInputChange(e.target.value)}
          value={text}
          size="3"
        >
          <TextField.Slot>
            <IoCalendar />
          </TextField.Slot>
          <TextField.Slot>
            <IconButton
              variant="ghost"
              size="1"
              style={{ margin: '0' }}
              disabled={!isValid}
              aria-label={t('calendar.selectDate.submit')}
              onClick={submit}
            >
              <FaCheck />
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
      </InputContainer>
    </CalendarSelectDateGrid>
  );
};
