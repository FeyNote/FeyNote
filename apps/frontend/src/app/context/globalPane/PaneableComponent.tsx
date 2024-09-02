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

/**
 * A mapping from components to the default title if the component is not rendered yet (therefore not able to provide it's own title to the pane manager yet)
 */
export const paneableComponentNameToDefaultI18nTitle = {
  [PaneableComponent.Dashboard]: 'dashboard.title',
  [PaneableComponent.Settings]: 'settings.title',
  [PaneableComponent.Artifact]: 'artifact.title',
  [PaneableComponent.AIThread]: 'assistant.title',
  [PaneableComponent.AIThreadsList]: 'assistant.thread.unknownTitle',
} satisfies Record<PaneableComponent, string>;
