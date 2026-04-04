import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useEffect, useState, type RefObject } from 'react';
import type { CollaborationManagerConnection } from '../../../utils/collaboration/collaborationManager';
import { useTranslation } from 'react-i18next';
import { ArtifactTableOfContentsItem } from './ArtifactTableOfContentsItem';
import { LuList } from '../../AppIcons';
import { FeynoteCard } from '../../card/FeynoteCard';
import { FeynoteCardHeader } from '../../card/FeynoteCardHeader';
import { FeynoteCardHeaderLabel } from '../../card/FeynoteCardHeaderLabel';

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
    <FeynoteCard>
      <FeynoteCardHeader>
        <LuList size={16} />
        <FeynoteCardHeaderLabel>
          {t('artifactRenderer.tableOfContents')}
        </FeynoteCardHeaderLabel>
      </FeynoteCardHeader>
      {toc.map((item) => (
        <ArtifactTableOfContentsItem
          key={item.id}
          artifactId={props.artifactId}
          item={item}
        />
      ))}
    </FeynoteCard>
  );
};
