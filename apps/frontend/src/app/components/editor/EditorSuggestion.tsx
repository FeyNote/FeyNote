import { IonItem, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';

export interface EditorSuggestionItem {
  id: string;
  displayName: string;
}

interface Props {
  items: EditorSuggestionItem[];
  loadingState: 'loading-initial' | 'loading' | 'loaded';
  selectedIndex: number;
  onItemClick?: (item: EditorSuggestionItem) => void;
}

export const EditorSuggestionMenuComponent = (props: Props) => {
  const { t } = useTranslation();

  if (!props.items.at(0)?.id) {
    return (
      <IonList>
        <IonItem>{t('editor.artifactBlockReference.noItems')}</IonItem>
      </IonList>
    );
  }

  return (
    <IonList>
      {props.items.map((el) => (
        <IonItem key={el.id} onClick={() => props.onItemClick?.(el)} button>
          {el.displayName}
        </IonItem>
      ))}
    </IonList>
  );
};
