import { ComponentProps } from 'react';
import { Artifact } from '../../components/artifact/Artifact';
import { RecentArtifacts } from '../../components/artifact/RecentArtifacts';
import { AIThread } from '../../components/assistant/AIThread';
import { AIThreadsList } from '../../components/assistant/AIThreadsList';
import { Dashboard } from '../../components/dashboard/Dashboard';
import { Graph } from '../../components/graph/Graph';
import { Settings } from '../../components/settings/Settings';
import { SharedContent } from '../../components/sharing/SharedContent';
import { NewArtifact } from '../../components/artifact/NewArtifact';
import { Contribute } from '../../components/payments/Contribute';

export enum PaneableComponent {
  Dashboard = 'Dashboard',
  Settings = 'Settings',
  Contribute = 'Contribute',
  NewArtifact = 'NewArtifact',
  Artifact = 'Artifact',
  AIThread = 'AIThread',
  AIThreadsList = 'AIThreadsList',
  Graph = 'Graph',
  SharedContent = 'SharedContent',
  RecentArtifacts = 'RecentArtifacts',
}

export type PaneableComponentProps = {
  [PaneableComponent.Dashboard]: ComponentProps<typeof Dashboard>;
  [PaneableComponent.Settings]: ComponentProps<typeof Settings>;
  [PaneableComponent.Contribute]: ComponentProps<typeof Contribute>;
  [PaneableComponent.NewArtifact]: ComponentProps<typeof NewArtifact>;
  [PaneableComponent.Artifact]: ComponentProps<typeof Artifact>;
  [PaneableComponent.AIThread]: ComponentProps<typeof AIThread>;
  [PaneableComponent.AIThreadsList]: ComponentProps<typeof AIThreadsList>;
  [PaneableComponent.Graph]: ComponentProps<typeof Graph>;
  [PaneableComponent.SharedContent]: ComponentProps<typeof SharedContent>;
  [PaneableComponent.RecentArtifacts]: ComponentProps<typeof RecentArtifacts>;
};

export const getPaneableComponent = (
  componentName: PaneableComponent,
): React.FC<any> => {
  const paneableComponentNameToComponent = {
    [PaneableComponent.Dashboard]: Dashboard,
    [PaneableComponent.Settings]: Settings,
    [PaneableComponent.Contribute]: Contribute,
    [PaneableComponent.NewArtifact]: NewArtifact,
    [PaneableComponent.Artifact]: Artifact,
    [PaneableComponent.AIThread]: AIThread,
    [PaneableComponent.AIThreadsList]: AIThreadsList,
    [PaneableComponent.Graph]: Graph,
    [PaneableComponent.SharedContent]: SharedContent,
    [PaneableComponent.RecentArtifacts]: RecentArtifacts,
  } satisfies Record<PaneableComponent, React.FC<any>>;

  return paneableComponentNameToComponent[componentName];
};

/**
 * A mapping from components to the default title if the component is not rendered yet (therefore not able to provide it's own title to the pane manager yet)
 */
export const paneableComponentNameToDefaultI18nTitle = {
  [PaneableComponent.Dashboard]: 'dashboard.title',
  [PaneableComponent.Settings]: 'settings.title',
  [PaneableComponent.Contribute]: 'contribute.title',
  [PaneableComponent.NewArtifact]: 'newArtifact.title',
  [PaneableComponent.Artifact]: 'artifact.title',
  [PaneableComponent.AIThread]: 'assistant.title',
  [PaneableComponent.AIThreadsList]: 'assistant.thread.unknownTitle',
  [PaneableComponent.Graph]: 'graph.title',
  [PaneableComponent.SharedContent]: 'sharedContent.title',
  [PaneableComponent.RecentArtifacts]: 'recentArtifacts.title',
} satisfies Record<PaneableComponent, string>;
