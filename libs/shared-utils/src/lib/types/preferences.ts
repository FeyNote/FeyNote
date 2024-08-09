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
  EnableSplitPane = 'global.enableSplitPane',
  Language = 'global.language',
  FontSize = 'global.fontSize',
  Theme = 'global.theme',
  CollaborationColor = 'global.collaborationColor',
  PreferencesSync = 'global.preferencesSync',
}

export interface AppPreferences {
  preferencesVersion: number;

  [PreferenceNames.EnableSplitPane]: boolean;
  [PreferenceNames.Language]: null | SupportedLanguages;
  [PreferenceNames.FontSize]: SupportedFontSize;
  [PreferenceNames.Theme]: AppTheme;
  [PreferenceNames.CollaborationColor]: string;
  [PreferenceNames.PreferencesSync]: PreferencesSync;
}
