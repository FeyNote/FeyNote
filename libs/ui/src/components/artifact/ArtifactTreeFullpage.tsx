import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PaneNav } from '../pane/PaneNav';
import { LuFolderTree } from '../AppIcons';
import { ArtifactTree } from './ArtifactTree';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';

const TREE_ID = 'artifactTreeFullpage';

const Card = styled.div`
  padding: 8px;
  border-radius: var(--card-border-radius);
  background: var(--card-background);
  box-shadow: var(--card-box-shadow);
`;

const Title = styled.h2`
  padding: 8px;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
`;

interface Props {
  workspaceId: string | null;
}

export const ArtifactTreeFullpage: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { workspaceSnapshot: selectedWorkspaceSnapshot } = useWorkspaceSnapshot(
    props.workspaceId || undefined,
  );

  const title = selectedWorkspaceSnapshot
    ? t('artifactTreeFullpage.title.workspaceNamed', {
        name: selectedWorkspaceSnapshot.meta.name || t('workspace.untitled'),
      })
    : t('artifactTreeFullpage.title');

  return (
    <PaneContentContainer>
      <PaneNav title={title} />
      <PaneContent>
        <Card>
          <Title>
            <LuFolderTree />
            &nbsp;{title}
          </Title>
          <ArtifactTree
            treeId={TREE_ID}
            workspaceId={props.workspaceId}
            registerAsGlobalTreeDragHandler={false}
            editable={true}
            mode="navigate"
            enableItemContextMenu={true}
            enableOpenItemMemory={true}
          />
        </Card>
      </PaneContent>
    </PaneContentContainer>
  );
};
