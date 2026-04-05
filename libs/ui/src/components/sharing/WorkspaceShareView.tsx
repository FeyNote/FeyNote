import { type MutableRefObject, useEffect, useMemo, useState } from 'react';
import { applyUpdate, Doc as YDoc } from 'yjs';
import { trpc } from '../../utils/trpc';
import { getWorkspaceSnapshotByIdAction } from '../../actions/getWorkspaceSnapshotByIdAction';
import { getWorkspaceYBinByIdAction } from '../../actions/getWorkspaceYBinByIdAction';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { useAlertContext } from '../../context/alert/AlertContext';
import styled from 'styled-components';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { WorkspaceIconBubble } from '../workspace/WorkspaceIconBubble';
import { ReadonlyArtifactViewer } from '../artifact/ReadonlySimpleArtifact';
import { ReadonlyArtifactTree } from './ReadonlyArtifactTree';
import { getWorkspaceArtifactsFromYDoc } from '@feynote/shared-utils';
import type {
  WorkspaceSnapshot,
  ArtifactSnapshot,
} from '@feynote/global-types';
import { Text } from '@radix-ui/themes';

const PageGrid = styled.div`
  display: grid;
  grid-template-rows: 75px auto;
  height: 100vh;
  overflow: hidden;
`;

const PageLRGrid = styled.div`
  display: grid;
  grid-template-columns: min(300px, 30%) auto;
  overflow: hidden;
`;

const TopBar = styled.div``;

const Sidebar = styled.div`
  padding-left: 10px;
`;

const SidebarContent = styled.div`
  background: var(--contrasting-element-background);
  border-radius: 4px;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray-a5);
`;

const SidebarTree = styled.div`
  flex: 1;
  overflow: auto;
  padding-right: 5px;
`;

const ContentArea = styled.div`
  overflow: auto;
`;

const FloatingPresentation = styled.div`
  width: min(max(900px, 80%), 100%);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 100px;
  padding-left: 8px;
  padding-right: 8px;
  overflow-y: auto;
`;

const NullStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

interface Props {
  workspaceId: string;
  selectedArtifactId: string | null;
  setSelectedArtifactId: (id: string | null) => void;
  workspaceArtifactIdsRef: MutableRefObject<Set<string>>;
}

export const WorkspaceShareView: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { showAlert } = useAlertContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const [workspaceSnapshot, setWorkspaceSnapshot] =
    useState<WorkspaceSnapshot>();
  const [workspaceYDoc, setWorkspaceYDoc] = useState<YDoc>();
  const [artifactSnapshots, setArtifactSnapshots] =
    useState<ArtifactSnapshot[]>();
  const [loadError, setLoadError] = useState(false);

  const handleError = (error: unknown) => {
    handleTRPCErrors(error, {
      401: () => {
        showAlert({
          title: t('workspaceShareView.unauthorized.header'),
          children: t('workspaceShareView.unauthorized.message'),
          actionButtons: [
            {
              title: t('generic.okay'),
              props: {
                onClick: () => {
                  window.location.href = '/';
                },
              },
            },
          ],
        });
      },
      404: () => {
        showAlert({
          title: t('workspaceShareView.notFound.header'),
          children: t('workspaceShareView.notFound.message'),
          actionButtons: [
            {
              title: t('generic.okay'),
              props: {
                onClick: () => {
                  window.location.href = '/';
                },
              },
            },
          ],
        });
      },
    });
    setLoadError(true);
  };

  useEffect(() => {
    getWorkspaceSnapshotByIdAction({ id: props.workspaceId })
      .then((result) => {
        setWorkspaceSnapshot(result);
      })
      .catch(handleError);

    getWorkspaceYBinByIdAction({ id: props.workspaceId })
      .then((result) => {
        const yDoc = new YDoc();
        applyUpdate(yDoc, result.yBin);
        setWorkspaceYDoc(yDoc);
      })
      .catch(handleError);

    trpc.workspace.getArtifactSnapshotsByWorkspaceId
      .query({ workspaceId: props.workspaceId })
      .then((result) => {
        setArtifactSnapshots(result);
      })
      .catch(handleError);
  }, [props.workspaceId]);

  const workspaceArtifactIds = useMemo(() => {
    if (!workspaceYDoc) return new Set<string>();
    const artifactIdsYKV = getWorkspaceArtifactsFromYDoc(workspaceYDoc);
    return new Set(artifactIdsYKV.yarray.toArray().map((el) => el.key));
  }, [workspaceYDoc]);

  props.workspaceArtifactIdsRef.current = workspaceArtifactIds;

  if (loadError) return null;
  if (!workspaceSnapshot || !workspaceYDoc || !artifactSnapshots) return null;

  return (
    <PageGrid>
      <TopBar>
        <LogoActionContainer />
      </TopBar>
      <PageLRGrid>
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <WorkspaceIconBubble
                icon={workspaceSnapshot.meta.icon}
                color={workspaceSnapshot.meta.color}
              />
              <Text
                size="2"
                weight="bold"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {workspaceSnapshot.meta.name}
              </Text>
            </SidebarHeader>
            <SidebarTree>
              <ReadonlyArtifactTree
                workspaceYDoc={workspaceYDoc}
                artifactSnapshots={artifactSnapshots}
                selectedArtifactId={props.selectedArtifactId}
                onSelectArtifact={props.setSelectedArtifactId}
              />
            </SidebarTree>
          </SidebarContent>
        </Sidebar>
        <ContentArea>
          {props.selectedArtifactId ? (
            <FloatingPresentation>
              <ReadonlyArtifactViewer
                key={props.selectedArtifactId}
                artifactId={props.selectedArtifactId}
              />
            </FloatingPresentation>
          ) : (
            <NullStateContainer>
              <Text size="2" color="gray">
                {t('workspaceShareView.empty')}
              </Text>
            </NullStateContainer>
          )}
        </ContentArea>
      </PageLRGrid>
    </PageGrid>
  );
};
