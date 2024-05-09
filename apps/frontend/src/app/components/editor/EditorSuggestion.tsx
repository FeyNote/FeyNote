import { ArtifactSummary } from '@feynote/prisma/types';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';

export interface EditorReferenceSuggestionItem {
  placeholder: boolean; // Blocknote hides our suggestion menu if there are no results
  artifactId: string;
  artifactBlockId?: string;
  artifact?: ArtifactSummary;
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
          <IonLabel>
            {el.referenceText}
            {el.artifact && <p>{el.artifact.title}</p>}
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};
