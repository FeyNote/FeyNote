import styled from 'styled-components';
import { WORKSPACE_ICON_BY_ID } from './workspaceConstants';
import { LuFolder } from '../AppIcons';
import type { WorkspaceSnapshot } from '@feynote/global-types';

export const WorkspaceBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  min-width: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  opacity: 0.65;
  color: white;
  font-size: 9px;
  margin-left: 2px;
`;

export const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-left: 4px;
  flex-shrink: 0;
`;

export const OverflowBadge = styled.span`
  font-size: 9px;
  color: var(--text-color-dim);
  margin-left: 2px;
`;

export const MAX_WORKSPACE_BADGES = 2;

interface Props {
  workspaceSnapshots: WorkspaceSnapshot[];
}

export const WorkspaceBadges: React.FC<Props> = (props) => {
  if (props.workspaceSnapshots.length === 0) return null;

  return (
    <BadgeContainer>
      {props.workspaceSnapshots
        .slice(0, MAX_WORKSPACE_BADGES)
        .map((snapshot) => {
          const Icon = WORKSPACE_ICON_BY_ID.get(snapshot.meta.icon) || LuFolder;
          return (
            <WorkspaceBadge key={snapshot.id} $color={snapshot.meta.color}>
              <Icon title={snapshot.meta.name} />
            </WorkspaceBadge>
          );
        })}
      {props.workspaceSnapshots.length > MAX_WORKSPACE_BADGES && (
        <OverflowBadge>
          +{props.workspaceSnapshots.length - MAX_WORKSPACE_BADGES}
        </OverflowBadge>
      )}
    </BadgeContainer>
  );
};
