import { IonIcon } from '@ionic/react';
import { Button, DropdownMenu } from '@radix-ui/themes';
import { filter } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiArtifactMoveInTreeDialog } from './MultiArtifactMoveInTreeDialog';
import { MultiArtifactDeleteDialog } from './MultiArtifactDeleteDialog';
import { MultiArtifactSharingDialog } from './MultiArtifactSharingDialog';

interface Props {
  selectedArtifactIds: ReadonlySet<string>;
}

export const AllArtifactsActions: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [showMoveInTreeUi, setShowMoveInTreeUi] = useState(false);
  const [showSharingUi, setShowSharingUi] = useState(false);
  const [showDeleteUi, setShowDeleteUi] = useState(false);

  if (!props.selectedArtifactIds.size) return;

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="soft">
            <IonIcon icon={filter} slot="start" />
            {t('allArtifacts.actions')}
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
    </>
  );
};
