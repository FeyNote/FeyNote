import type { ArtifactSnapshot } from '@feynote/global-types';
import { IonIcon } from '@ionic/react';
import type { ArtifactType } from '@prisma/client';
import { calendar, document, pencil } from 'ionicons/icons';
import { CiInboxIn, CiInboxOut, CiUser } from '../../AppIcons';
import styled from 'styled-components';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../../context/globalPane/GlobalPaneContext';
import { useMemo, type MouseEvent } from 'react';
import { usePaneContext } from '../../../context/pane/PaneContext';
import { useTranslation } from 'react-i18next';

const ItemRow = styled.div<{
  $numDataCols: number;
}>`
  display: grid;

  grid-template-columns: min-content auto repeat(
      ${(props) => props.$numDataCols},
      min-content
    );
  align-items: center;
`;

const ItemIcon = styled(IonIcon)`
  margin-left: 18px;
  font-size: 20px;
`;

const ItemTitle = styled.div`
  margin-left: 6px;

  .itemTitleInner:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const ItemDataslot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 4px;
  padding-right: 4px;
`;

const artifactTypeToIcon: Record<ArtifactType, string> = {
  tiptap: document,
  calendar,
  tldraw: pencil,
};

interface Props {
  artifact: ArtifactSnapshot;
  incomingEdgeCount: number;
  outgoingEdgeCount: number;
  dataViews: {
    createdAt: boolean;
    updatedAt: boolean;
    userCount: boolean;
    incomingEdgeCount: boolean;
    outgoingEdgeCount: boolean;
  };
}

export const AllArtifactsItem: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = usePaneContext();

  const goTo = (event: MouseEvent) => {
    navigate(
      PaneableComponent.Artifact,
      { id: props.artifact.id },
      event.metaKey || event.ctrlKey
        ? PaneTransition.NewTab
        : PaneTransition.Push,
      !(event.metaKey || event.ctrlKey),
    );
  };

  const numDataCols = 4;

  const createdAtDate = useMemo(() => {
    return new Date(props.artifact.meta.createdAt).toLocaleDateString();
  }, [props.artifact.meta.createdAt]);
  const createdAtDateTime = useMemo(() => {
    return new Date(props.artifact.meta.createdAt).toLocaleString();
  }, [props.artifact.meta.createdAt]);

  const updatedAtDate = useMemo(() => {
    return new Date(props.artifact.updatedAt).toLocaleDateString();
  }, [props.artifact.updatedAt]);
  const updatedAtDateTime = useMemo(() => {
    return new Date(props.artifact.updatedAt).toLocaleString();
  }, [props.artifact.updatedAt]);

  return (
    <ItemRow $numDataCols={numDataCols}>
      <ItemIcon icon={artifactTypeToIcon[props.artifact.meta.type]} />
      <ItemTitle>
        <span
          className="itemTitleInner"
          onClick={(event) => (event.stopPropagation(), goTo(event))}
        >
          {props.artifact.meta.title}
        </span>
      </ItemTitle>

      {props.dataViews.createdAt && (
        <div
          title={t('allArtifacts.createdAt', {
            date: createdAtDateTime,
          })}
        >
          {createdAtDate}
        </div>
      )}
      {props.dataViews.updatedAt && (
        <div
          title={t('allArtifacts.updatedAt', {
            date: updatedAtDateTime,
          })}
        >
          {updatedAtDate}
        </div>
      )}
      {props.dataViews.userCount && (
        <ItemDataslot
          title={t('allArtifacts.userCount', {
            count: props.artifact.userAccess.length,
          })}
        >
          {props.artifact.userAccess.length}
          <CiUser />
        </ItemDataslot>
      )}
      {props.dataViews.outgoingEdgeCount && (
        <ItemDataslot
          title={t('allArtifacts.outgoingEdgeCount', {
            count: props.outgoingEdgeCount,
          })}
        >
          {props.outgoingEdgeCount}
          <CiInboxOut />
        </ItemDataslot>
      )}
      {props.dataViews.incomingEdgeCount && (
        <ItemDataslot
          title={t('allArtifacts.incomingEdgeCount', {
            count: props.incomingEdgeCount,
          })}
        >
          {props.incomingEdgeCount}
          <CiInboxIn />
        </ItemDataslot>
      )}
    </ItemRow>
  );
};
