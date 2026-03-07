import { IonCard, IonCardTitle, IonContent, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PaneNav } from '../pane/PaneNav';
import { LuFolderTree } from '../AppIcons';
import { ArtifactTree } from './ArtifactTree';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';

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

export const ArtifactTreeFullpage: React.FC = () => {
  const { t } = useTranslation();
  const { currentWorkspaceId } = useCurrentWorkspaceId();

  const titleKey = currentWorkspaceId
    ? 'artifactTreeFullpage.title.workspace'
    : 'artifactTreeFullpage.title';

  return (
    <IonPage>
      <PaneNav title={t(titleKey)} />
      <IonContent>
        <Card>
          <Title>
            <LuFolderTree />
            &nbsp;{t(titleKey)}
          </Title>
          <ArtifactTree
            treeId={TREE_ID}
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
