import styled from 'styled-components';
import { WORKSPACE_ICON_BY_ID } from './workspaceConstants';
import { LuFolder } from '../AppIcons';

const Bubble = styled.div<{ $color: string; $size: number }>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  min-width: ${(props) => props.$size}px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color-inverted);
  font-size: ${(props) => Math.round(props.$size * 0.65)}px;
`;

interface Props {
  icon: string;
  color: string;
  size?: number;
}

export const WorkspaceIconBubble: React.FC<Props> = ({
  icon,
  color,
  size = 28,
}) => {
  const IconComponent = WORKSPACE_ICON_BY_ID.get(icon) ?? LuFolder;

  return (
    <Bubble $color={color} $size={size}>
      <IconComponent />
    </Bubble>
  );
};
