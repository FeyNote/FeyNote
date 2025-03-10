import type {
  TableOfContentData,
  TableOfContentDataItem,
} from '@tiptap-pro/extension-table-of-contents';
import { useEffect, useState, type MouseEvent, type RefObject } from 'react';
import type { CollaborationManagerConnection } from '../../editor/collaborationManager';
import { IonCard, IonIcon, IonListHeader } from '@ionic/react';
import { list } from 'ionicons/icons';
import { CompactIonItem } from '../../CompactIonItem';
import { useTranslation } from 'react-i18next';
import { TextSelection } from '@tiptap/pm/state';
import styled from 'styled-components';
import { scrollBlockIntoView } from '../../editor/scrollBlockIntoView';
import { animateHighlightBlock } from '../../editor/animateHighlightBlock';

const ToCItem = styled(CompactIonItem)<{ $isActive: boolean }>`
  margin-left: calc(0.875rem * (var(--toc-level) - 1));

  ${({ $isActive }) =>
    $isActive &&
    `
    background-color: var(--ion-color-light-tint);
  `}
`;

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  onTocUpdateRef: RefObject<
    ((content: TableOfContentData) => void) | undefined
  >;
}

export const ArtifactTableOfContents: React.FC<Props> = (props) => {
  const [toc, setToc] = useState<TableOfContentData | undefined>(undefined);
  const { t } = useTranslation();

  useEffect(() => {
    props.onTocUpdateRef.current = (content) => {
      setToc(content);
    };
  }, []);

  if (!toc) {
    return null;
  }

  const onItemClick = (event: MouseEvent, item: TableOfContentDataItem) => {
    event.preventDefault();
    const { editor, dom } = item;

    try {
      const pos = editor.view.posAtDOM(dom, 0);

      const tr = editor.view.state.tr;
      tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
      editor.view.dispatch(tr);
      editor.view.focus();
    } catch (e) {
      // This bit of code is a little finnicky, since we can't rely on the create/destroy state of the react editor
      // and unfortunately tiptap doesn't call the ref every time the editor is re-created
      console.error(e);
    }

    scrollBlockIntoView(item.id);
    animateHighlightBlock(item.id);
  };

  return (
    <IonCard>
      <IonListHeader>
        <IonIcon icon={list} size="small" />
        &nbsp;&nbsp;
        {t('artifactRenderer.tableOfContents')}
      </IonListHeader>
      {toc.map((item) => (
        <ToCItem
          key={item.id}
          $isActive={item.isActive}
          onClick={(event) => onItemClick(event, item)}
          lines="none"
          button
          style={{
            '--toc-level': item.level,
          }}
        >
          {item.textContent}
        </ToCItem>
      ))}
    </IonCard>
  );
};
