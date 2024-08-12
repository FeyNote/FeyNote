import type { YCalendarConfig } from '@feynote/shared-utils';
import { IonButton, IonIcon, IonInput } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import type { TypedMap } from 'yjs-types';
import { calendar, send } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { isAllowedDateSpecifier } from './calendarDateSpecifierRegex';

interface Props {
  configMap: TypedMap<Partial<YCalendarConfig>>;
  onSubmit: (date: string) => void;
}

export const CalendarSelectDateInput: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLIonInputElement>(null);

  const isValid = !!isAllowedDateSpecifier(text);

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    if (!isValid) return;

    props.onSubmit(text);
  };

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    });
  }, []);

  return (
    <div>
      Render calendar here
      <IonInput
        ref={inputRef}
        onKeyUp={keyUpHandler}
        onIonChange={(e) => setText(e.detail.value || '')}
      >
        <IonIcon slot="start" icon={calendar} aria-hidden="true"></IonIcon>
        <IonButton
          disabled={!isValid}
          fill="clear"
          slot="end"
          aria-label={t('calendar.selectDate')}
        >
          <IonIcon slot="icon-only" name={send} aria-hidden="true"></IonIcon>
        </IonButton>
      </IonInput>
    </div>
  );
};
