import { useState } from "react";
import * as Sentry from '@sentry/react';
import { useTranslation } from "react-i18next";
import { ArtifactTree, UNCATEGORIZED_TREE_NODE_ID } from "../ArtifactTree";
import { withCollaborationConnection } from "../../editor/collaborationManager";
import { useSessionContext } from "../../../context/session/SessionContext";
import { getArtifactTreeFromYDoc } from "../../../utils/artifactTree/getArtifactTreeFromYDoc";
import { addArtifactToArtifactTree } from "../../../utils/artifactTree/addArtifactToArtifactTree";
import { canAddArtifactToArtifactTreeAt } from "../../../utils/artifactTree/canAddArtifactToArtifactTreeAt";
import { recursiveRemoveFromArtifactTree } from "../../../utils/artifactTree/recursiveRemoveFromArtifactTree";
import { calculateOrderForArtifactTreeNode } from "../../../utils/artifactTree/calculateOrderForArtifactTreeNode";
import { ActionDialog } from "../../sharedComponents/ActionDialog";

interface Props {
  artifactIds: ReadonlySet<string>,
  close: () => void,
}

export const MultiArtifactMoveInTreeDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const [treeId] = useState(`moveInTree-${crypto.randomUUID()}`);
  const [resultStats, setResultStats] = useState<{
    workingSetSize: number,
    total: number,
    success: number,
    failed: number,
  }>();
  const [pendingMoveTarget, setPendingMoveTarget] = useState<string>();

  const moveInTreeAction = async (parentNodeId: string) => {
    setResultStats({
      workingSetSize: props.artifactIds.size,
      total: 0,
      success: 0,
      failed: 0,
    });

    await withCollaborationConnection(`userTree:${session.userId}`, async (connection) => {
      const treeYKV = getArtifactTreeFromYDoc(connection.yjsDoc).yKeyValue;

      if (parentNodeId === UNCATEGORIZED_TREE_NODE_ID) {
        try {
          connection.yjsDoc.transact(() => {
            recursiveRemoveFromArtifactTree({
              ref: treeYKV,
              nodeIds: props.artifactIds
            });
          });

          setResultStats({
            workingSetSize: props.artifactIds.size,
            total: props.artifactIds.size,
            success: props.artifactIds.size,
            failed: 0,
          });
        } catch(e) {
          Sentry.captureException(e);
        }

        return;
      }

      let successCount = 0;
      let failedCount = 0;
      try {
        connection.yjsDoc.transact(() => {
          for (const artifactId of props.artifactIds) {
            const canAddAt = canAddArtifactToArtifactTreeAt({
              ref: treeYKV,
              id: artifactId,
              parentNodeId,
            })
            if (!canAddAt) {
              failedCount++;
              continue;
            }

            addArtifactToArtifactTree({
              ref: treeYKV,
              id: artifactId,
              parentArtifactId: parentNodeId,
              order: calculateOrderForArtifactTreeNode({
                treeYKV,
                parentNodeId: parentNodeId,
                location: {
                  position: "end",
                }
              }),
            });

            successCount++;
          }
        });
      } catch(e) {
        failedCount = props.artifactIds.size - successCount;
        Sentry.captureException(e);
      }

      setResultStats({
        workingSetSize: props.artifactIds.size,
        total: props.artifactIds.size,
        success: successCount,
        failed: failedCount
      });
    });
  }

  const confirmationDialog = (
    <ActionDialog
      title={t('allArtifacts.moveInTree.confirm.title')}
      description={t('allArtifacts.moveInTree.confirm.message', {
        count: props.artifactIds.size
      })}
      open={!!pendingMoveTarget}
      onOpenChange={(state) => {
        if (!state) setPendingMoveTarget(undefined)
      }}
      actionButtons={[{
        title: t('generic.cancel'),
        props: {
          color: "gray"
        }
      }, {
        title: t('generic.confirm'),
        props: {
          onClick: () => pendingMoveTarget && moveInTreeAction(pendingMoveTarget)
        }
      }]}
    />
  );

  const processingStatusDialog = (
    <ActionDialog
      title={t('allArtifacts.moveInTree.moving.title')}
      description={`${
        t('allArtifacts.moveInTree.moving.message', {
          totalCount: resultStats?.workingSetSize,
          successCount: resultStats?.success,
        })
      } ${
        !!resultStats?.failed ? t('allArtifacts.moveInTree.moving.message.failed', {
            count: resultStats?.failed,
        }) : ''
      }`}
      open={!!resultStats}
      onOpenChange={() => {
        if (resultStats?.total !== resultStats?.workingSetSize) {
          props.close();
        }
      }}
      actionButtons={[{
        title: t('generic.close'),
        props: {
          onClick: () => props.close(),
          disabled: resultStats?.total !== resultStats?.workingSetSize
        }
      }]}
    />
  );

  return (
    <>
      <ActionDialog
        title={t('allArtifacts.moveInTree.title')}
        description={t('allArtifacts.moveInTree.subtitle')}
        open={true}
        onOpenChange={props.close}
        actionButtons={[{
          title: t('generic.cancel'),
          props: {
            color: "gray"
          }
        }]}
      >
        <ArtifactTree
          treeId={treeId}
          registerAsGlobalTreeDragHandler={false}
          editable={false}
          mode="select"
          enableItemContextMenu={false}
          onNodeClicked={(info) => {
            if (info.targetType === "item") {
              setPendingMoveTarget(info.targetItem.toString());
            } else {
              throw new Error("Unsupported onNodeClicked targetType!");
            }
          }}
        />
      </ActionDialog>
      {processingStatusDialog}
      {confirmationDialog}
    </>
  );
}
