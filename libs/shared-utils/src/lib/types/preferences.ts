import { SupportedLanguages } from './i18n';

export enum SupportedFontSize {
  X1_0 = '1rem',
  PX14 = '14px',
  PX16 = '16px',
  PX18 = '18px',
  PX20 = '20px',
  PX22 = '22px',
  PX24 = '24px',
}

export enum AppTheme {
  Default = 'default',
  Light = 'light',
  Dark = 'dark',
}

export enum PreferencesSync {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum PreferenceNames {
  LeftPaneStartOpen = 'leftPane.startOpen',
  LeftPaneShowArtifactTree = 'leftPane.showArtifactTree',
  LeftPaneArtifactTreeShowUncategorized = 'leftPane.appTree.showUncategorized',
  LeftPaneShowRecentThreads = 'leftPane.showRecentThreads',

  RightPaneStartOpen = 'rightPane.startOpen',

  Language = 'global.language',
  FontSize = 'global.fontSize',
  Theme = 'global.theme',
  CollaborationColor = 'global.collaborationColor',
  PreferencesSync = 'global.preferencesSync',

  GraphShowOrphans = 'graph.showOrphans',
}

export interface AppPreferences {
  preferencesVersion: number;

  [PreferenceNames.LeftPaneStartOpen]: boolean;
  [PreferenceNames.LeftPaneShowArtifactTree]: boolean;
  [PreferenceNames.LeftPaneArtifactTreeShowUncategorized]: boolean;
  [PreferenceNames.LeftPaneShowRecentThreads]: boolean;

  [PreferenceNames.RightPaneStartOpen]: boolean;

  [PreferenceNames.Language]: null | SupportedLanguages;
  [PreferenceNames.FontSize]: SupportedFontSize;
  [PreferenceNames.Theme]: AppTheme;
  [PreferenceNames.CollaborationColor]: string;
  [PreferenceNames.PreferencesSync]: PreferencesSync;

  [PreferenceNames.GraphShowOrphans]: boolean;
}
