import { ComponentProps } from 'react';
import { Artifact } from '../../components/artifact/Artifact';
import { AIThread } from '../../components/assistant/AIThread';
import { AIThreadsList } from '../../components/assistant/AIThreadsList';
import { Dashboard } from '../../components/dashboard/Dashboard';
import { Graph } from '../../components/graph/Graph';
import { Settings } from '../../components/settings/Settings';
import { SharedContent } from '../../components/sharing/SharedContent';
import { CreateNew } from '../../components/artifact/CreateNew';
import { Contribute } from '../../components/payments/Contribute';
import { PersistentSearch } from '../../components/search/PersistentSearch';
import { Export } from '../../components/importExport/Export';
import { Import } from '../../components/importExport/Import';
import { AllArtifacts } from '../../components/artifact/allArtifacts/AllArtifacts';
import { ArtifactTreeFullpage } from '../../components/artifact/ArtifactTreeFullpage';
import { ImportFileUpload } from '../../components/importExport/ImportFileUpload';
import { Inbox } from '../../components/inbox/Inbox';
import { KeyboardShortcuts } from '../../components/settings/KeyboardShortcuts';

export enum PaneableComponent {
  Dashboard = 'Dashboard',
  Settings = 'Settings',
  Contribute = 'Contribute',
  CreateNew = 'CreateNew',
  Artifact = 'Artifact',
  AllArtifacts = 'AllArtifacts',
  ArtifactTreeFullpage = 'ArtifactTreeFullpage',
  AIThread = 'AIThread',
  AIThreadsList = 'AIThreadsList',
  Graph = 'Graph',
  SharedContent = 'SharedContent',
  Export = 'Export',
  Import = 'Import',
  ImportFileUpload = 'ImportFileUpload',
  PersistentSearch = 'PersistentSearch',
  Inbox = 'Inbox',
  KeyboardShortcuts = 'KeyboardShortcuts',
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
  [PaneableComponent.CreateNew]: ComponentProps<typeof CreateNew>;
  [PaneableComponent.Artifact]: ComponentProps<typeof Artifact>;
  [PaneableComponent.AllArtifacts]: ComponentProps<typeof AllArtifacts>;
  [PaneableComponent.ArtifactTreeFullpage]: ComponentProps<
    typeof ArtifactTreeFullpage
  >;
  [PaneableComponent.AIThread]: ComponentProps<typeof AIThread>;
  [PaneableComponent.AIThreadsList]: ComponentProps<typeof AIThreadsList>;
  [PaneableComponent.Graph]: ComponentProps<typeof Graph>;
  [PaneableComponent.SharedContent]: ComponentProps<typeof SharedContent>;
  [PaneableComponent.Import]: ComponentProps<typeof Import>;
  [PaneableComponent.ImportFileUpload]: ComponentProps<typeof ImportFileUpload>;
  [PaneableComponent.Export]: ComponentProps<typeof Export>;
  [PaneableComponent.PersistentSearch]: ComponentProps<typeof PersistentSearch>;
  [PaneableComponent.Inbox]: ComponentProps<typeof Inbox>;
  [PaneableComponent.KeyboardShortcuts]: ComponentProps<
    typeof KeyboardShortcuts
  >;
  [PaneableComponent.NonPanedComponent]: ComponentProps<typeof emptyFunc>;
};

export const getPaneableComponent = <T extends PaneableComponent>(
  componentName: PaneableComponent,
): React.FC<PaneableComponentProps[T]> => {
  const paneableComponentNameToComponent = {
    [PaneableComponent.Dashboard]: Dashboard,
    [PaneableComponent.Settings]: Settings,
    [PaneableComponent.Contribute]: Contribute,
    [PaneableComponent.CreateNew]: CreateNew,
    [PaneableComponent.Artifact]: Artifact,
    [PaneableComponent.AllArtifacts]: AllArtifacts,
    [PaneableComponent.ArtifactTreeFullpage]: ArtifactTreeFullpage,
    [PaneableComponent.AIThread]: AIThread,
    [PaneableComponent.AIThreadsList]: AIThreadsList,
    [PaneableComponent.Graph]: Graph,
    [PaneableComponent.SharedContent]: SharedContent,
    [PaneableComponent.Export]: Export,
    [PaneableComponent.Import]: Import,
    [PaneableComponent.ImportFileUpload]: ImportFileUpload,
    [PaneableComponent.PersistentSearch]: PersistentSearch,
    [PaneableComponent.Inbox]: Inbox,
    [PaneableComponent.KeyboardShortcuts]: KeyboardShortcuts,
    [PaneableComponent.NonPanedComponent]: emptyFunc,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } satisfies Record<PaneableComponent, React.FC<any>>;

  const component =
    paneableComponentNameToComponent[componentName] ?? Dashboard;

  return component as unknown as React.FC<PaneableComponentProps[T]>;
};

/**
 * A mapping from components to the default title if the component is not rendered yet (therefore not able to provide it's own title to the pane manager yet)
 */
export const paneableComponentNameToDefaultI18nTitle = {
  [PaneableComponent.Dashboard]: 'dashboard.title',
  [PaneableComponent.Settings]: 'settings.title',
  [PaneableComponent.Contribute]: 'contribute.title',
  [PaneableComponent.CreateNew]: 'createNew.title',
  [PaneableComponent.Artifact]: 'artifact.title',
  [PaneableComponent.AllArtifacts]: 'allArtifacts.title',
  [PaneableComponent.ArtifactTreeFullpage]: 'artifactTreeFullpage.title',
  [PaneableComponent.AIThread]: 'assistant.title',
  [PaneableComponent.AIThreadsList]: 'assistant.thread.unknownTitle',
  [PaneableComponent.Graph]: 'graph.title',
  [PaneableComponent.SharedContent]: 'sharedContent.title',
  [PaneableComponent.Export]: 'export.title',
  [PaneableComponent.Import]: 'import.title',
  [PaneableComponent.ImportFileUpload]: 'importFileUpload.title',
  [PaneableComponent.PersistentSearch]: 'persistentSearch.title',
  [PaneableComponent.Inbox]: 'inbox.title',
  [PaneableComponent.KeyboardShortcuts]: 'settings.keyboardShortcuts.title',
  [PaneableComponent.NonPanedComponent]: 'generic.error',
} satisfies Record<PaneableComponent, string>;
