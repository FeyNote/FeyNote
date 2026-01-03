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
import { PersistentSearch } from '../../components/search/PersistentSearch';
import { Export } from '../../components/importExport/Export';
import { Import } from '../../components/importExport/Import';
import { AllArtifacts } from '../../components/artifact/allArtifacts/AllArtifacts';
import { ImportFileUpload } from '../../components/importExport/ImportFileUpload';

export enum PaneableComponent {
  Dashboard = 'Dashboard',
  Settings = 'Settings',
  Contribute = 'Contribute',
  NewArtifact = 'NewArtifact',
  Artifact = 'Artifact',
  AllArtifacts = 'AllArtifacts',
  AIThread = 'AIThread',
  AIThreadsList = 'AIThreadsList',
  Graph = 'Graph',
  SharedContent = 'SharedContent',
  RecentArtifacts = 'RecentArtifacts',
  Export = 'Export',
  Import = 'Import',
  ImportFileUpload = 'ImportFileUpload',
  PersistentSearch = 'PersistentSearch',
  /**
   * This is included to support no-pane components
   */
  NonPanedComponent = 'NonPanedComponent',
}

const emptyFunc: React.FC = () => null;

export type PaneableComponentProps = {
  [PaneableComponent.Dashboard]: ComponentProps<typeof Dashboard>;
  [PaneableComponent.Settings]: ComponentProps<typeof Settings>;
  [PaneableComponent.Contribute]: ComponentProps<typeof Contribute>;
  [PaneableComponent.NewArtifact]: ComponentProps<typeof NewArtifact>;
  [PaneableComponent.Artifact]: ComponentProps<typeof Artifact>;
  [PaneableComponent.AllArtifacts]: ComponentProps<typeof AllArtifacts>;
  [PaneableComponent.AIThread]: ComponentProps<typeof AIThread>;
  [PaneableComponent.AIThreadsList]: ComponentProps<typeof AIThreadsList>;
  [PaneableComponent.Graph]: ComponentProps<typeof Graph>;
  [PaneableComponent.SharedContent]: ComponentProps<typeof SharedContent>;
  [PaneableComponent.RecentArtifacts]: ComponentProps<typeof RecentArtifacts>;
  [PaneableComponent.Import]: ComponentProps<typeof Import>;
  [PaneableComponent.ImportFileUpload]: ComponentProps<typeof ImportFileUpload>;
  [PaneableComponent.Export]: ComponentProps<typeof Export>;
  [PaneableComponent.PersistentSearch]: ComponentProps<typeof PersistentSearch>;
  [PaneableComponent.NonPanedComponent]: ComponentProps<typeof emptyFunc>;
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
    [PaneableComponent.AllArtifacts]: AllArtifacts,
    [PaneableComponent.AIThread]: AIThread,
    [PaneableComponent.AIThreadsList]: AIThreadsList,
    [PaneableComponent.Graph]: Graph,
    [PaneableComponent.SharedContent]: SharedContent,
    [PaneableComponent.RecentArtifacts]: RecentArtifacts,
    [PaneableComponent.Export]: Export,
    [PaneableComponent.Import]: Import,
    [PaneableComponent.ImportFileUpload]: ImportFileUpload,
    [PaneableComponent.PersistentSearch]: PersistentSearch,
    [PaneableComponent.NonPanedComponent]: emptyFunc,
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
  [PaneableComponent.AllArtifacts]: 'allArtifacts.title',
  [PaneableComponent.AIThread]: 'assistant.title',
  [PaneableComponent.AIThreadsList]: 'assistant.thread.unknownTitle',
  [PaneableComponent.Graph]: 'graph.title',
  [PaneableComponent.SharedContent]: 'sharedContent.title',
  [PaneableComponent.RecentArtifacts]: 'recentArtifacts.title',
  [PaneableComponent.Export]: 'export.title',
  [PaneableComponent.Import]: 'import.title',
  [PaneableComponent.ImportFileUpload]: 'importFileUpload.title',
  [PaneableComponent.PersistentSearch]: 'persistentSearch.title',
  [PaneableComponent.NonPanedComponent]: 'generic.error',
} satisfies Record<PaneableComponent, string>;
