import type { ArtifactAccessLevel } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { KnownUserDoc } from '../../../utils/localDb/localDb';
import { Button, DropdownMenu } from '@radix-ui/themes';

const ItemRow = styled.div`
  display: grid;

  margin-left: 16px;
  grid-template-columns: min-content auto min-content min-content;
  gap: 16px;
  align-items: center;
`;

interface Props {
  onAccessLevelChange: (level: ArtifactAccessLevel) => void;
  userInfo: KnownUserDoc | undefined;
  stats: {
    coowner: number;
    readwrite: number;
    readonly: number;
    noaccess: number;
  };
}

export const MultiArtifactSharingDialogUser: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <ItemRow>
      <div>
        {props.userInfo?.name || t('multiArtifactSharing.dialog.unknownUser')}
      </div>
      <div title={t('multiArtifactSharing.stats')}>
        {props.stats.readwrite}/{props.stats.readonly}/{props.stats.noaccess}
      </div>
      <div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                props.onAccessLevelChange('readwrite');
              }}
            >
              {t('multiArtifactSharing.setReadWrite')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                props.onAccessLevelChange('readonly');
              }}
            >
              {t('multiArtifactSharing.setReadOnly')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                props.onAccessLevelChange('noaccess');
              }}
            >
              {t('multiArtifactSharing.setNoAccess')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </ItemRow>
  );
};
