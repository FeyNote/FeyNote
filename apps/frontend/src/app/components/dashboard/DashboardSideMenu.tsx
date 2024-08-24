import type { ArtifactDTO } from '@feynote/prisma/types';

interface Props {
  artifacts: ArtifactDTO[];
}

export const DashboardSideMenu: React.FC<Props> = (props) => {
  return <>{props.artifacts.length}</>;
};
