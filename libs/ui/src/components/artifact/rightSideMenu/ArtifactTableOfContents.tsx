import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useEffect, useState, type RefObject } from 'react';
import type { CollaborationManagerConnection } from '../../editor/collaborationManager';
import { IonCard, IonIcon, IonListHeader } from '@ionic/react';
import { list } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ArtifactTableOfContentsItem } from './ArtifactTableOfContentsItem';

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

  if (!toc?.length) {
    return null;
  }

  return (
    <IonCard>
      <IonListHeader>
        <IonIcon icon={list} size="small" />
        &nbsp;&nbsp;
        {t('artifactRenderer.tableOfContents')}
      </IonListHeader>
      {toc.map((item) => (
        <ArtifactTableOfContentsItem
          key={item.id}
          artifactId={props.artifactId}
          item={item}
        />
      ))}
    </IonCard>
  );
};
