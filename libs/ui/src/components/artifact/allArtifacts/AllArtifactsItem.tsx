import type { ArtifactDTO } from "@feynote/global-types";
import { IonIcon } from "@ionic/react";
import type { ArtifactType } from "@prisma/client";
import { calendar, document, pencil } from "ionicons/icons";
import { CiInboxIn, CiInboxOut, CiUser } from "react-icons/ci";
import styled from "styled-components";
import { Checkbox } from "../../sharedComponents/Checkbox";
import { PaneableComponent } from "../../../context/globalPane/PaneableComponent";
import { PaneTransition } from "../../../context/globalPane/GlobalPaneContext";
import { useContext, useMemo, type MouseEvent } from "react";
import { PaneContext } from "../../../context/pane/PaneContext";
import { useTranslation } from "react-i18next";

const ItemRow = styled.div<{
  $numDataCols: number
}>`
  display: grid;
  user-select: none;

  grid-template-columns: min-content min-content auto repeat(${(props) => props.$numDataCols}, min-content);
  align-items: center;
  padding: 16px;

  transition: background-color 100ms;
  background-color: var(--ion-background-color-step-50);
  border-radius: 4px;
  margin-top: 6px;
  margin-bottom: 6px;

  &:hover:not(:has(.itemTitleInner:hover)) {
    background-color: var(--ion-background-color-step-100);
    cursor: pointer;
  }
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
  tldraw: pencil
}

interface Props {
  artifact: ArtifactDTO,
  selected: boolean,
  onSelectionChanged: (selected: boolean, withShift: boolean) => void
  dataViews: {
    createdAt: boolean,
    updatedAt: boolean,
    userCount: boolean,
    incomingReferences: boolean,
    outgoingReferences: boolean,
  }
}

export const AllArtifactsItem: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(PaneContext);

  const goTo = (event: MouseEvent) => {
    navigate(
      PaneableComponent.Artifact,
      { id: props.artifact.id },
      event.metaKey || event.ctrlKey
        ? PaneTransition.NewTab
        : PaneTransition.Push,
      !(event.metaKey || event.ctrlKey),
    );
  }

  const numDataCols = 4;

  const createdAtDate = useMemo(() => {
    return props.artifact.createdAt.toLocaleDateString();
  }, [props.artifact.createdAt]);
  const createdAtDateTime = useMemo(() => {
    return props.artifact.createdAt.toLocaleString();
  }, [props.artifact.createdAt]);

  const updatedAtDate = useMemo(() => {
    return props.artifact.updatedAt.toLocaleDateString();
  }, [props.artifact.updatedAt]);
  const updatedAtDateTime = useMemo(() => {
    return props.artifact.updatedAt.toLocaleString();
  }, [props.artifact.updatedAt]);

  return (
    <ItemRow
      onClick={(event) => props.onSelectionChanged(!props.selected, event.shiftKey)}
      $numDataCols={numDataCols}
    >
      <Checkbox
        checked={props.selected}
        size="medium"
      />

      <ItemIcon
        icon={artifactTypeToIcon[props.artifact.type]}
      />
      <ItemTitle>
        <span
          className="itemTitleInner"
          onClick={(event) => (event.stopPropagation(), goTo(event))}
        >
          {props.artifact.title}
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
            count: props.artifact.artifactShares.length + 1,
          })}>
          {props.artifact.artifactShares.length + 1}
          <CiUser />
        </ItemDataslot>
      )}
      {props.dataViews.outgoingReferences && (
        <ItemDataslot title={t('allArtifacts.outgoingReferences', {
          count: props.artifact.artifactReferences.length
        })}>
          {props.artifact.artifactReferences.length}
          <CiInboxOut />
        </ItemDataslot>
      )}
      {props.dataViews.incomingReferences && (
        <ItemDataslot title={t('allArtifacts.incomingReferences', {
          count: props.artifact.incomingArtifactReferences.length
        })}>
          {props.artifact.incomingArtifactReferences.length}
          <CiInboxIn />
        </ItemDataslot>
      )}
    </ItemRow>
  );
}
