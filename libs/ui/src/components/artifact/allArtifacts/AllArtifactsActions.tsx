import { Button, DropdownMenu } from '@radix-ui/themes';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiArtifactMoveInTreeDialog } from './MultiArtifactMoveInTreeDialog';
import { MultiArtifactDeleteDialog } from './MultiArtifactDeleteDialog';
import { MultiArtifactSharingDialog } from './MultiArtifactSharingDialog';
import styled from 'styled-components';

const Container = styled.div`
  margin-left: auto;
`;

interface Props {
  selectedArtifactIds: ReadonlySet<string>;
}

export const AllArtifactsActions: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [showMoveInTreeUi, setShowMoveInTreeUi] = useState(false);
  const [showSharingUi, setShowSharingUi] = useState(false);
  const [showDeleteUi, setShowDeleteUi] = useState(false);

  return (
    <Container>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={!props.selectedArtifactIds.size}>
          <Button variant="soft">
            {t('allArtifacts.actions')}
            <DropdownMenu.TriggerIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={() => setShowMoveInTreeUi(true)}>
            {t('allArtifacts.actions.moveInTree')}
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => setShowSharingUi(true)}>
            {t('allArtifacts.actions.manageSharing')}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={() => setShowDeleteUi(true)} color="red">
            {t('allArtifacts.actions.delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {showMoveInTreeUi && (
        <MultiArtifactMoveInTreeDialog
          artifactIds={props.selectedArtifactIds}
          close={() => setShowMoveInTreeUi(false)}
        />
      )}
      {showDeleteUi && (
        <MultiArtifactDeleteDialog
          artifactIds={props.selectedArtifactIds}
          close={() => setShowDeleteUi(false)}
        />
      )}
      {showSharingUi && (
        <MultiArtifactSharingDialog
          artifactIds={props.selectedArtifactIds}
          close={() => setShowSharingUi(false)}
        />
      )}
    </Container>
  );
};
