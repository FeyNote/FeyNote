import { useTranslation } from 'react-i18next';
import { PaneTransition } from '../../../context/globalPane/GlobalPaneContext';
import { type PaneContextData } from '../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { ContextMenu } from '@radix-ui/themes';

interface Props {
  children: React.ReactNode;
  artifactId: string;
  paneId: string;
  delete: () => void;
  navigate: PaneContextData['navigate'];
}

export const AllArtifactsItemContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = props;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{props.children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.Item
            onClick={() =>
              navigate(
                PaneableComponent.Artifact,
                {
                  id: props.artifactId,
                },
                PaneTransition.HSplit,
              )
            }
          >
            {t('contextMenu.splitRight')}
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() =>
              navigate(
                PaneableComponent.Artifact,
                {
                  id: props.artifactId,
                },
                PaneTransition.VSplit,
              )
            }
          >
            {t('contextMenu.splitDown')}
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() =>
              navigate(
                PaneableComponent.Artifact,
                {
                  id: props.artifactId,
                },
                PaneTransition.NewTab,
              )
            }
          >
            {t('contextMenu.newTab')}
          </ContextMenu.Item>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.Item color={'red'} onClick={() => props.delete()}>
            {t('allArtifacts.artifactContextMenu.delete')}
          </ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};
