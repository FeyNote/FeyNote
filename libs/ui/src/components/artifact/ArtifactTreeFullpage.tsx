import { IonCard, IonCardTitle, IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PaneNav } from '../pane/PaneNav';
import { LuFolderTree } from '../AppIcons';
import { ArtifactTree } from './ArtifactTree';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';

const TREE_ID = 'artifactTreeFullpage';

const Card = styled(IonCard)`
  padding: 8px;
  border-radius: 8px;
`;

const Title = styled(IonCardTitle)`
  padding: 8px;
  display: flex;
  align-items: center;
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
    <IonPage>
      <PaneNav title={title} />
      <IonContent>
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
      </IonContent>
    </IonPage>
  );
};
