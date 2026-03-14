import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, TextField } from '@radix-ui/themes';
import styled from 'styled-components';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { WORKSPACE_COLORS, WORKSPACE_ICONS } from './workspaceConstants';
import { getWorkspaceMetaYKVFromYDoc } from '@feynote/shared-utils';
import type { Doc } from 'yjs';
import { WorkspaceSharingPanel } from './WorkspaceSharingPanel';
import { useObserveWorkspaceMeta } from '../../utils/collaboration/useObserveWorkspaceMeta';

const SectionLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 6px;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  justify-items: center;
  gap: 6px;
`;

const IconButton = styled.button<{ $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid
    ${(props) => (props.$selected ? 'var(--text-color)' : 'transparent')};
  background: var(--general-background);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-color);

  &:hover {
    background-color: var(--general-background-hover);
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  justify-items: center;
  gap: 6px;
`;

const ColorButton = styled.button<{ $color: string; $selected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  border: 3px solid
    ${(props) => (props.$selected ? 'var(--text-color)' : 'transparent')};
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$selected ? `inset 0 0 0 2px var(--card-background)` : 'none'};

  &:hover {
    opacity: 0.85;
  }
`;

export const WorkspaceModalContent: React.FC<{ yDoc: Doc }> = (props) => {
  const { t } = useTranslation();
  const meta = useObserveWorkspaceMeta(props.yDoc);
  const metaYKV = useMemo(
    () => getWorkspaceMetaYKVFromYDoc(props.yDoc),
    [props.yDoc],
  );

  if (!meta.id) return null;

  return (
    <>
      <Flex align="center" gap="3" mb="3">
        <WorkspaceIconBubble icon={meta.icon} color={meta.color} size={40} />
        <TextField.Root
          value={meta.name}
          onChange={(e) => metaYKV.set('name', e.target.value)}
          placeholder={t('workspace.name.placeholder')}
          style={{ flex: 1 }}
        />
      </Flex>

      <SectionLabel>{t('workspace.icon')}</SectionLabel>
      <IconGrid>
        {WORKSPACE_ICONS.map((entry) => {
          const Icon = entry.icon;
          return (
            <IconButton
              key={entry.id}
              $selected={entry.id === meta.icon}
              onClick={() => metaYKV.set('icon', entry.id)}
            >
              <Icon />
            </IconButton>
          );
        })}
      </IconGrid>

      <SectionLabel>{t('workspace.color')}</SectionLabel>
      <ColorGrid>
        {WORKSPACE_COLORS.map((c) => (
          <ColorButton
            key={c}
            $color={c}
            $selected={c === meta.color}
            onClick={() => metaYKV.set('color', c)}
          />
        ))}
      </ColorGrid>

      <WorkspaceSharingPanel id={meta.id} yDoc={props.yDoc} />
    </>
  );
};
