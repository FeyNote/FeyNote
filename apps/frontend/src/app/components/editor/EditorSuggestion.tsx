import { IonItem, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';

export interface EditorReferenceSuggestionItem {
  placeholder: boolean; // Blocknote hides our suggestion menu if there are no results
  artifactId: string;
  artifactBlockId?: string;
  referenceText: string;
}

interface Props {
  items: EditorReferenceSuggestionItem[];
  loadingState: 'loading-initial' | 'loading' | 'loaded';
  selectedIndex: number;
  onItemClick?: (item: EditorReferenceSuggestionItem) => void;
}

export const EditorReferenceMenuComponent: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  if (props.items.at(0)?.placeholder) {
    return (
      <IonList>
        <IonItem>{t('editor.referenceMenu.noItems')}</IonItem>
      </IonList>
    );
  }

  return (
    <IonList>
      {props.items.map((el) => (
        <IonItem
          key={el.artifactId + el.artifactBlockId}
          onClick={() => props.onItemClick?.(el)}
          button
        >
          {el.referenceText}
        </IonItem>
      ))}
    </IonList>
  );
};
