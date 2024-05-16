import { SuggestionMenuProps } from '@blocknote/react';
import { ArtifactSummary } from '@feynote/prisma/types';
import { IonItem, IonLabel, IonList } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const StyledIonList = styled(IonList)`
  width: 300px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.2);
`;

const StyledIonItem = styled(IonItem)<{
  $selected: boolean;
}>`
  ${(props) => (props.$selected ? '--background: rgba(0,0,0,0.2);' : '')}
`;

const filterSuggestionItem = (el: EditorReferenceSuggestionItem) => {
  // Strip all non-word characters, as well as underscores and numbers (word characters
  // include underscores and numbers) for the sake of making sure there's really content to
  // the item we're going to suggest.
  return el.referenceText.replace(new RegExp(/[\W_0-9]/, 'g'), '').length > 0;
};

export interface EditorReferenceSuggestionItem {
  placeholder: boolean; // Blocknote hides our suggestion menu if there are no results
  artifactId: string;
  artifactBlockId?: string;
  artifact?: ArtifactSummary;
  referenceText: string;
}

export const EditorReferenceMenu: React.FC<
  SuggestionMenuProps<EditorReferenceSuggestionItem>
> = (props) => {
  const { t } = useTranslation();

  const firstItem = props.items.at(0);
  if (firstItem?.placeholder) {
    return (
      <StyledIonList>
        <IonItem onClick={() => props.onItemClick?.(firstItem)} button>
          {t('editor.referenceMenu.noItems')}
        </IonItem>
      </StyledIonList>
    );
  }

  return (
    <StyledIonList>
      {props.items.filter(filterSuggestionItem).map((el, idx) => (
        <StyledIonItem
          key={el.artifactId + el.artifactBlockId}
          onClick={() => props.onItemClick?.(el)}
          $selected={props.selectedIndex === idx}
          button
        >
          <IonLabel>
            {el.referenceText}
            {el.artifact && <p>{el.artifact.title}</p>}
          </IonLabel>
        </StyledIonItem>
      ))}
    </StyledIonList>
  );
};
