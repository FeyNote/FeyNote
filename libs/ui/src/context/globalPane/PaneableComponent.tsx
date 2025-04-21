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
import { JobDashboard } from '../../components/importExport/JobDashboard';
import { Contribute } from '../../components/payments/Contribute';
import { PersistentSearch } from '../../components/search/PersistentSearch';
import { ImportFromObsidian } from '../../components/importExport/ImportFromObsidian';
import { ImportFromLogseq } from '../../components/importExport/ImportFromLogseq';
import { Export } from '../../components/importExport/Export';

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
  JobDashboard = 'JobDashboard',
  ImportFromLogseq = 'ImportFromLogseq',
  ImportFromObsidian = 'ImportFromObsidian',
  Export = 'Export',
  PersistentSearch = 'PersistentSearch',
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
  [PaneableComponent.JobDashboard]: ComponentProps<typeof JobDashboard>;
  [PaneableComponent.ImportFromLogseq]: ComponentProps<typeof ImportFromLogseq>;
  [PaneableComponent.ImportFromObsidian]: ComponentProps<
    typeof ImportFromObsidian
  >;
  [PaneableComponent.Export]: ComponentProps<typeof Export>;
  [PaneableComponent.PersistentSearch]: ComponentProps<typeof PersistentSearch>;
};

export const getPaneableComponent = <T extends PaneableComponent>(
  componentName: PaneableComponent,
): React.FC<PaneableComponentProps[T]> => {
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
    [PaneableComponent.JobDashboard]: JobDashboard,
    [PaneableComponent.ImportFromLogseq]: ImportFromLogseq,
    [PaneableComponent.Export]: Export,
    [PaneableComponent.ImportFromObsidian]: ImportFromObsidian,
    [PaneableComponent.PersistentSearch]: PersistentSearch,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } satisfies Record<PaneableComponent, React.FC<any>>;

  // I was unable to find a way to map-type this properly
  return paneableComponentNameToComponent[componentName] as unknown as React.FC<
    PaneableComponentProps[T]
  >;
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
  [PaneableComponent.JobDashboard]: 'jobDashboard.title',
  [PaneableComponent.Export]: 'export.title',
  [PaneableComponent.ImportFromLogseq]: 'importFromLogseq.title',
  [PaneableComponent.ImportFromObsidian]: 'importFromObsidian.title',
  [PaneableComponent.PersistentSearch]: 'persistentSearch.title',
} satisfies Record<PaneableComponent, string>;
