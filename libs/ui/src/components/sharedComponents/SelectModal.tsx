import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;

  min-height: 100%;
  padding-bottom: 50px;
`;

const PaddedLabelContainer = styled.div`
  padding: 16px;
`;

interface Props<T> {
  dismiss: (value: Array<T>) => void;
  title: string;
  subtitle?: string;
  selectedValues: ReadonlyArray<T>;
  allowMultiple: boolean;
  options: {
    value: T;
    title: string;
  }[];
}

export const SelectModal = <T extends string>(props: Props<T>) => {
  const { t } = useTranslation();
  const [selectedValues, setSelectedValues] = useState(
    () => new Set(props.selectedValues),
  );

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{props.title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => props.dismiss([...selectedValues])}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Container>
          {props.subtitle && (
            <PaddedLabelContainer>
              <IonLabel>{props.subtitle}</IonLabel>
            </PaddedLabelContainer>
          )}
          {props.options.map((el) => (
            <IonItem key={el.value}>
              <IonCheckbox
                labelPlacement="start"
                checked={selectedValues.has(el.value)}
                onIonChange={(event) => {
                  if (props.allowMultiple) {
                    const editableSet = new Set(selectedValues);
                    if (event.detail.checked) {
                      editableSet.add(el.value);
                    } else {
                      editableSet.delete(el.value);
                    }
                    setSelectedValues(editableSet);
                  } else {
                    setSelectedValues(new Set([el.value]));
                  }
                }}
              >
                {el.title}
              </IonCheckbox>
            </IonItem>
          ))}
        </Container>
      </IonContent>
      <IonFooter style={{ textAlign: 'right' }}>
        <IonButton
          fill="clear"
          onClick={() => props.dismiss([...props.selectedValues])}
        >
          {t('generic.cancel')}
        </IonButton>
        <IonButton
          fill="clear"
          onClick={() => props.dismiss([...selectedValues])}
        >
          {t('generic.okay')}
        </IonButton>
      </IonFooter>
    </>
  );
};
