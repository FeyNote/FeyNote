import { Artifact } from '../../components/artifact/Artifact';
import { AIThread } from '../../components/assistant/AIThread';
import { AIThreadsList } from '../../components/assistant/AIThreadsList';
import { Dashboard } from '../../components/dashboard/Dashboard';
import { Settings } from '../../components/settings/Settings';

export enum PaneableComponent {
  Dashboard = 'Dashboard',
  Settings = 'Settings',
  Artifact = 'Artifact',
  AIThread = 'AIThread',
  AIThreadsList = 'AIThreadsList',
}

export const paneableComponentNameToComponent = {
  [PaneableComponent.Dashboard]: Dashboard,
  [PaneableComponent.Settings]: Settings,
  [PaneableComponent.Artifact]: Artifact,
  [PaneableComponent.AIThread]: AIThread,
  [PaneableComponent.AIThreadsList]: AIThreadsList,
} satisfies Record<PaneableComponent, React.FC<any>>;
