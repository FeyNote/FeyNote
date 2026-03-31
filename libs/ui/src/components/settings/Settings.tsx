import {
  AppTheme,
  ArtifactReferenceExistingArtifactSharingMode,
  ArtifactReferenceNewArtifactSharingMode,
  PreferenceNames,
  PreferencesSync,
  SupportedFontSize,
  SupportedLanguages,
  WorkspaceArtifactSharingMode,
  WorkspaceNewItemMode,
} from '@feynote/shared-utils';
import { Select, Switch } from '@radix-ui/themes';
import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import styled from 'styled-components';
import { getRandomColor } from '../../utils/getRandomColor';
import { PaneNav } from '../pane/PaneNav';
import {
  CiUser,
  FaPencil,
  IoChevronForward,
  IoInformation,
  LuFolder,
  LuMonitor,
} from '../AppIcons';
import { useSessionContext } from '../../context/session/SessionContext';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { DebugDump } from './DebugDump';
import { InfoButton } from '../info/InfoButton';
import { useAlertContext } from '../../context/alert/AlertContext';
import { getIsElectron } from '../../utils/getIsElectron';
import { getElectronAPI } from '../../utils/electronAPI';
import { getLiveExportManager } from '../../utils/liveExport/LiveExportManager';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { ProgressBarDialog } from '../info/ProgressBarDialog';
import { FeynoteCard } from '../card/FeynoteCard';
import { FeynoteCardHeader } from '../card/FeynoteCardHeader';
import { FeynoteCardHeaderLabel } from '../card/FeynoteCardHeaderLabel';
import { FeynoteCardItem } from '../card/FeynoteCardItem';
import { FeynoteCardItemLabel } from '../card/FeynoteCardItemLabel';
import { FeynoteCardItemSublabel } from '../card/FeynoteCardItemSublabel';

const SettingsLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const VersionText = styled.p`
  margin: 16px;
  font-size: 0.75rem;
  color: var(--text-color-dim);
`;

const themeToI18n = {
  [AppTheme.Default]: 'settings.theme.default',
  [AppTheme.Light]: 'settings.theme.light',
  [AppTheme.Dark]: 'settings.theme.dark',
} satisfies Record<AppTheme, string>;

const fontSizeToI18n = {
  [SupportedFontSize.X1_0]: 'settings.fontSize.default',
  [SupportedFontSize.PX14]: 'settings.fontSize.px14',
  [SupportedFontSize.PX16]: 'settings.fontSize.px16',
  [SupportedFontSize.PX18]: 'settings.fontSize.px18',
  [SupportedFontSize.PX20]: 'settings.fontSize.px20',
  [SupportedFontSize.PX22]: 'settings.fontSize.px22',
  [SupportedFontSize.PX24]: 'settings.fontSize.px24',
} satisfies Record<SupportedFontSize, string>;

const artifactReferenceNewArtifactSharingModeToI18n = {
  [ArtifactReferenceNewArtifactSharingMode.Always]:
    'settings.artifact.referenceNewArtifactSharingMode.always',
  [ArtifactReferenceNewArtifactSharingMode.Never]:
    'settings.artifact.referenceNewArtifactSharingMode.never',
  [ArtifactReferenceNewArtifactSharingMode.Prompt]:
    'settings.artifact.referenceNewArtifactSharingMode.prompt',
} satisfies Record<ArtifactReferenceNewArtifactSharingMode, string>;

const artifactReferenceExistingArtifactSharingModeToI18n = {
  [ArtifactReferenceExistingArtifactSharingMode.Never]:
    'settings.artifact.referenceExistingArtifactSharingMode.never',
  [ArtifactReferenceExistingArtifactSharingMode.Prompt]:
    'settings.artifact.referenceExistingArtifactSharingMode.prompt',
} satisfies Record<ArtifactReferenceExistingArtifactSharingMode, string>;

const workspaceNewItemModeToI18n = {
  [WorkspaceNewItemMode.Always]: 'settings.workspace.newItemMode.always',
  [WorkspaceNewItemMode.Never]: 'settings.workspace.newItemMode.never',
  [WorkspaceNewItemMode.Prompt]: 'settings.workspace.newItemMode.prompt',
} satisfies Record<WorkspaceNewItemMode, string>;

const workspaceArtifactSharingModeToI18n = {
  [WorkspaceArtifactSharingMode.Always]:
    'settings.workspace.artifactSharingMode.always',
  [WorkspaceArtifactSharingMode.Never]:
    'settings.workspace.artifactSharingMode.never',
  [WorkspaceArtifactSharingMode.Prompt]:
    'settings.workspace.artifactSharingMode.prompt',
} satisfies Record<WorkspaceArtifactSharingMode, string>;

const colorOptions = {
  '#1abc9c': 'settings.collaborationColor.turquoise',
  '#2ecc71': 'settings.collaborationColor.emerald',
  '#3498db': 'settings.collaborationColor.skyblue',
  '#9b59b6': 'settings.collaborationColor.purple',
  '#f1c40f': 'settings.collaborationColor.yellow',
  '#f39c12': 'settings.collaborationColor.orange',
  '#d35400': 'settings.collaborationColor.darkorange',
  '#e74c3c': 'settings.collaborationColor.red',
  '#c0392b': 'settings.collaborationColor.darkred',
};

export const Settings: React.FC = () => {
  const { showAlert } = useAlertContext();
  const { setPreference, getPreference, _preferencesService } =
    usePreferencesContext();
  const { session, setSession } = useSessionContext();
  const { navigate } = usePaneContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const languageOptions = useMemo(() => {
    try {
      const languageOptions = [];
      for (const supportedLanguage of Object.values(SupportedLanguages)) {
        const locale = new Intl.DisplayNames(supportedLanguage, {
          type: 'language',
          fallback: 'code',
        });

        languageOptions.push([
          supportedLanguage,
          locale.of(supportedLanguage) || supportedLanguage,
        ]);
      }

      return languageOptions.sort((a, b) => a[1].localeCompare(b[1]));
    } catch (_e) {
      console.error('Intl not supported');

      return Object.values(SupportedLanguages).map((code) => [code, code]);
    }
  }, []);

  const togglePreferencesSync = async (enable: boolean) => {
    const value = enable ? PreferencesSync.Enabled : PreferencesSync.Disabled;

    if (value === PreferencesSync.Disabled) {
      // When disabling, we don't need to worry about sync complexities
      setPreference(PreferenceNames.PreferencesSync, value);
      return;
    }

    // When enabling, we need to worry about local vs cloud version, since
    // we don't want to wipe either the local or cloud version of a user's
    // preferences without asking.
    showAlert({
      title: t('settings.preferencesSync.header'),
      children: t('settings.preferencesSync.message'),
      actionButtons: [
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
            onClick: () => {
              window.location.reload();
            },
          },
        },
        {
          title: t('settings.preferencesSync.local'),
          props: {
            onClick: () => {
              setPreference(PreferenceNames.PreferencesSync, value);
            },
          },
        },
        {
          title: t('settings.preferencesSync.remote'),
          props: {
            onClick: () => {
              // Set directly on service so as not to cause a sync
              _preferencesService.preferences[PreferenceNames.PreferencesSync] =
                value;
              // Must persist preferences local-only first so that the sync setting is preserved
              _preferencesService.save(true);
              // Load cloud settings into our local, (they are not saved to localstorage yet)
              _preferencesService.load();
              // Persist cloud-downloaded settings to localstorage
              _preferencesService.save(true);
              // Trigger re-render of app
              setPreference(PreferenceNames.PreferencesSync, value);
            },
          },
        },
      ],
    });
  };

  const collaborationColorValue = Object.keys(colorOptions).includes(
    getPreference(PreferenceNames.CollaborationColor),
  )
    ? getPreference(PreferenceNames.CollaborationColor)
    : 'random';

  const triggerResetEmail = async () => {
    const result = await trpc.user.triggerResetEmail
      .mutate({
        email: session.email,
        returnUrl: window.location.origin,
      })
      .catch((e) => {
        handleTRPCErrors(e, {
          409: () => {
            showAlert({
              title: t('settings.account.triggerResetEmail.noPassword.header'),
              children: t(
                'settings.account.triggerResetEmail.noPassword.message',
              ),
              actionButtons: 'okay',
            });
          },
        });
      });

    if (!result) return;

    showAlert({
      title: t('settings.account.triggerResetEmail.header'),
      children: t('settings.account.triggerResetEmail.message'),
      actionButtons: 'okay',
    });
  };

  const liveExportPath = getPreference(PreferenceNames.LiveExportStoragePath);

  const [liveExportPendingPath, setLiveExportPendingPath] = useState<
    string | null
  >(null);
  const [liveExportProgress, setLiveExportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [liveExportComplete, setLiveExportComplete] = useState(false);

  const enableLiveExport = async () => {
    const electronAPI = getElectronAPI();
    if (!electronAPI) return;

    const selectedPath = await electronAPI.selectDirectory();
    if (!selectedPath) return;

    setLiveExportPendingPath(selectedPath);
  };

  const confirmBulkExport = async () => {
    if (!liveExportPendingPath) return;
    const selectedPath = liveExportPendingPath;
    setLiveExportPendingPath(null);

    setPreference(PreferenceNames.LiveExportStoragePath, selectedPath);
    const manager = getLiveExportManager();
    await manager.setExportPath(selectedPath);

    try {
      await manager.runBulkExport((current, total) => {
        setLiveExportProgress({ current, total });
      });

      setLiveExportComplete(true);
    } catch (e) {
      console.error('[LiveExport] Bulk export failed:', e);
      setPreference(PreferenceNames.LiveExportStoragePath, null);
      await manager.setExportPath(null);
    } finally {
      setLiveExportProgress(null);
    }
  };

  const disableLiveExport = () => {
    setPreference(PreferenceNames.LiveExportStoragePath, null);
    getLiveExportManager().setExportPath(null);
  };

  const triggerResetPassword = async () => {
    const result = await trpc.user.triggerResetPassword
      .mutate({
        email: session.email,
        returnUrl: window.location.origin,
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });

    if (!result) return;

    showAlert({
      title: t('settings.account.triggerResetPassword.header'),
      children: t('settings.account.triggerResetPassword.message'),
      actionButtons: 'okay',
    });
  };

  return (
    <PaneContentContainer>
      <PaneNav title={t('settings.title')} />
      <PaneContent>
        <FeynoteCard>
          <FeynoteCardHeader>
            <IoInformation size={16} />
            <FeynoteCardHeaderLabel>
              {t('settings.help')}
            </FeynoteCardHeaderLabel>
          </FeynoteCardHeader>
          <SettingsLink
            href="https://docs.feynote.com"
            target="_blank"
            rel="noreferrer"
          >
            <FeynoteCardItem $isButton>
              <FeynoteCardItemLabel>
                {t('settings.help.docs')}
              </FeynoteCardItemLabel>
              <IoChevronForward size={14} color="var(--text-color-dim)" />
            </FeynoteCardItem>
          </SettingsLink>
          <SettingsLink
            href="https://discord.gg/Tz8trXrd4C"
            target="_blank"
            rel="noreferrer"
          >
            <FeynoteCardItem $isButton>
              <FeynoteCardItemLabel>
                {t('settings.help.contact')}
              </FeynoteCardItemLabel>
              <IoChevronForward size={14} color="var(--text-color-dim)" />
            </FeynoteCardItem>
          </SettingsLink>
          <DebugDump>
            <FeynoteCardItem $isButton>
              <FeynoteCardItemLabel>
                {t('settings.help.debugDownload')}
              </FeynoteCardItemLabel>
              <IoChevronForward size={14} color="var(--text-color-dim)" />
            </FeynoteCardItem>
          </DebugDump>
        </FeynoteCard>
        <FeynoteCard>
          <FeynoteCardHeader>
            <CiUser size={16} />
            <FeynoteCardHeaderLabel>
              {t('settings.account')}
              <FeynoteCardItemSublabel>
                {t('settings.email.current', {
                  email: session.email,
                })}
              </FeynoteCardItemSublabel>
            </FeynoteCardHeaderLabel>
            <InfoButton
              message={t('settings.account.help')}
              docsLink="https://docs.feynote.com/settings/general/#account-settings"
            />
          </FeynoteCardHeader>
          <FeynoteCardItem
            $isButton
            onClick={() => {
              navigate(PaneableComponent.Import, {}, PaneTransition.Push);
            }}
          >
            <FeynoteCardItemLabel>{t('settings.import')}</FeynoteCardItemLabel>
            <IoChevronForward size={14} color="var(--text-color-dim)" />
          </FeynoteCardItem>
          <FeynoteCardItem
            $isButton
            onClick={() => {
              navigate(PaneableComponent.Export, {}, PaneTransition.Push);
            }}
          >
            <FeynoteCardItemLabel>{t('settings.export')}</FeynoteCardItemLabel>
            <IoChevronForward size={14} color="var(--text-color-dim)" />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.preferencesSync')}
            </FeynoteCardItemLabel>
            <Switch
              checked={
                getPreference(PreferenceNames.PreferencesSync) ===
                PreferencesSync.Enabled
              }
              onCheckedChange={(checked) => togglePreferencesSync(checked)}
            />
          </FeynoteCardItem>
          <FeynoteCardItem $isButton onClick={triggerResetEmail}>
            <FeynoteCardItemLabel>
              {t('settings.resetEmail')}
            </FeynoteCardItemLabel>
            <IoChevronForward size={14} color="var(--text-color-dim)" />
          </FeynoteCardItem>
          <FeynoteCardItem $isButton onClick={triggerResetPassword}>
            <FeynoteCardItemLabel>
              {t('settings.resetPassword')}
            </FeynoteCardItemLabel>
            <IoChevronForward size={14} color="var(--text-color-dim)" />
          </FeynoteCardItem>
          <FeynoteCardItem $isButton onClick={() => setSession(null)}>
            <FeynoteCardItemLabel>{t('menu.signOut')}</FeynoteCardItemLabel>
            <IoChevronForward size={14} color="var(--text-color-dim)" />
          </FeynoteCardItem>
        </FeynoteCard>
        <FeynoteCard>
          <FeynoteCardHeader>
            <LuFolder size={16} />
            <FeynoteCardHeaderLabel>
              {t('settings.liveExport.title')}
              <FeynoteCardItemSublabel>
                {t('settings.liveExport.description')}
              </FeynoteCardItemSublabel>
            </FeynoteCardHeaderLabel>
            <InfoButton
              message={t('settings.liveExport.help')}
              docsLink="https://docs.feynote.com/settings/live-export/"
            />
          </FeynoteCardHeader>
          {getIsElectron() ? (
            liveExportPath ? (
              <>
                <FeynoteCardItem>
                  <FeynoteCardItemSublabel style={{ whiteSpace: 'normal' }}>
                    {t('settings.liveExport.currentPath', {
                      path: liveExportPath,
                    })}
                  </FeynoteCardItemSublabel>
                </FeynoteCardItem>
                <FeynoteCardItem $isButton onClick={disableLiveExport}>
                  <FeynoteCardItemLabel style={{ color: 'var(--red-11)' }}>
                    {t('settings.liveExport.disable')}
                  </FeynoteCardItemLabel>
                  <IoChevronForward size={14} color="var(--text-color-dim)" />
                </FeynoteCardItem>
              </>
            ) : (
              <FeynoteCardItem $isButton onClick={enableLiveExport}>
                <FeynoteCardItemLabel>
                  {t('settings.liveExport.selectFolder')}
                </FeynoteCardItemLabel>
                <IoChevronForward size={14} color="var(--text-color-dim)" />
              </FeynoteCardItem>
            )
          ) : (
            <FeynoteCardItem>
              <FeynoteCardItemSublabel>
                {t('settings.liveExport.desktopOnly')}
              </FeynoteCardItemSublabel>
            </FeynoteCardItem>
          )}
        </FeynoteCard>
        <FeynoteCard>
          <FeynoteCardHeader>
            <LuMonitor size={16} />
            <FeynoteCardHeaderLabel>
              {t('settings.interface')}
            </FeynoteCardHeaderLabel>
            <InfoButton
              message={t('settings.interface.help')}
              docsLink="https://docs.feynote.com/settings/general/#interface-settings"
            />
          </FeynoteCardHeader>
          <FeynoteCardItem
            $isButton
            onClick={() => {
              navigate(
                PaneableComponent.KeyboardShortcuts,
                {},
                PaneTransition.Push,
              );
            }}
          >
            <FeynoteCardItemLabel>
              {t('settings.keyboardShortcuts')}
            </FeynoteCardItemLabel>
            <IoChevronForward size={14} color="var(--text-color-dim)" />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.panesRememberOpenState')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(PreferenceNames.PanesRememberOpenState)}
              onCheckedChange={(checked) =>
                setPreference(PreferenceNames.PanesRememberOpenState, checked)
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.leftSideMenu')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(PreferenceNames.LeftPaneStartOpen)}
              onCheckedChange={(checked) =>
                setPreference(PreferenceNames.LeftPaneStartOpen, checked)
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.rightSideMenu')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(PreferenceNames.RightPaneStartOpen)}
              onCheckedChange={(checked) =>
                setPreference(PreferenceNames.RightPaneStartOpen, checked)
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.leftSideMenuShowArtifactTree')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(PreferenceNames.LeftPaneShowArtifactTree)}
              onCheckedChange={(checked) =>
                setPreference(PreferenceNames.LeftPaneShowArtifactTree, checked)
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.leftSideMenuArtifactTreeAutoExpandOnNavigate')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(
                PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate,
              )}
              onCheckedChange={(checked) =>
                setPreference(
                  PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate,
                  checked,
                )
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.leftSideMenuArtifactTreeShowUncategorized')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(
                PreferenceNames.LeftPaneArtifactTreeShowUncategorized,
              )}
              onCheckedChange={(checked) =>
                setPreference(
                  PreferenceNames.LeftPaneArtifactTreeShowUncategorized,
                  checked,
                )
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.leftSideMenuShowRecentThreads')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(PreferenceNames.LeftPaneShowRecentThreads)}
              onCheckedChange={(checked) =>
                setPreference(
                  PreferenceNames.LeftPaneShowRecentThreads,
                  checked,
                )
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.workspace.globalSearchAcrossAll')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(
                PreferenceNames.GlobalSearchAcrossAllWorkspaces,
              )}
              onCheckedChange={(checked) =>
                setPreference(
                  PreferenceNames.GlobalSearchAcrossAllWorkspaces,
                  checked,
                )
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            {t('settings.language')}
            <Select.Root
              value={getPreference(PreferenceNames.Language) || 'navigator'}
              onValueChange={(value) =>
                setPreference(
                  PreferenceNames.Language,
                  value === 'navigator' ? null : (value as SupportedLanguages),
                )
              }
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                <Select.Item value="navigator" key="navigator">
                  {t('settings.language.default')}
                </Select.Item>
                {languageOptions.map((languageOption) => (
                  <Select.Item
                    value={languageOption[0]}
                    key={languageOption[0]}
                  >
                    {languageOption[1]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
          <FeynoteCardItem>
            {t('settings.theme')}
            <Select.Root
              value={getPreference(PreferenceNames.Theme)}
              onValueChange={(value) =>
                setPreference(PreferenceNames.Theme, value as AppTheme)
              }
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                {Object.values(AppTheme).map((theme) => (
                  <Select.Item value={theme} key={theme}>
                    {t(themeToI18n[theme])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
          <FeynoteCardItem>
            {t('settings.fontSize')}
            <Select.Root
              value={getPreference(PreferenceNames.FontSize)}
              onValueChange={(value) =>
                setPreference(
                  PreferenceNames.FontSize,
                  value as SupportedFontSize,
                )
              }
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                {Object.values(SupportedFontSize).map((fontSize) => (
                  <Select.Item value={fontSize} key={fontSize}>
                    {t(fontSizeToI18n[fontSize])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
        </FeynoteCard>
        <FeynoteCard>
          <FeynoteCardHeader>
            <FaPencil size={16} />
            <FeynoteCardHeaderLabel>
              {t('settings.editor')}
            </FeynoteCardHeaderLabel>
            <InfoButton
              message={t('settings.editor.help')}
              docsLink="https://docs.feynote.com/settings/general/#editor-settings"
            />
          </FeynoteCardHeader>
          <FeynoteCardItem>
            {t('settings.artifact.referenceNewArtifactSharingMode')}
            <Select.Root
              value={getPreference(
                PreferenceNames.ArtifactReferenceNewArtifactSharingMode,
              )}
              onValueChange={(value) =>
                setPreference(
                  PreferenceNames.ArtifactReferenceNewArtifactSharingMode,
                  value as ArtifactReferenceNewArtifactSharingMode,
                )
              }
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                {Object.values(ArtifactReferenceNewArtifactSharingMode).map(
                  (value) => (
                    <Select.Item value={value} key={value}>
                      {t(artifactReferenceNewArtifactSharingModeToI18n[value])}
                    </Select.Item>
                  ),
                )}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
          <FeynoteCardItem>
            {t('settings.artifact.referenceExistingArtifactSharingMode')}
            <Select.Root
              value={getPreference(
                PreferenceNames.ArtifactReferenceExistingArtifactSharingMode,
              )}
              onValueChange={(value) =>
                setPreference(
                  PreferenceNames.ArtifactReferenceExistingArtifactSharingMode,
                  value as ArtifactReferenceExistingArtifactSharingMode,
                )
              }
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                {Object.values(
                  ArtifactReferenceExistingArtifactSharingMode,
                ).map((value) => (
                  <Select.Item value={value} key={value}>
                    {t(
                      artifactReferenceExistingArtifactSharingModeToI18n[value],
                    )}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
          <FeynoteCardItem>
            {t('settings.workspace.newItemMode')}
            <Select.Root
              value={getPreference(PreferenceNames.WorkspaceNewItemMode)}
              onValueChange={(value) =>
                setPreference(
                  PreferenceNames.WorkspaceNewItemMode,
                  value as WorkspaceNewItemMode,
                )
              }
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                {Object.values(WorkspaceNewItemMode).map((value) => (
                  <Select.Item value={value} key={value}>
                    {t(workspaceNewItemModeToI18n[value])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
          <FeynoteCardItem>
            {t('settings.workspace.artifactSharingMode')}
            <Select.Root
              value={getPreference(
                PreferenceNames.WorkspaceArtifactSharingMode,
              )}
              onValueChange={(value) =>
                setPreference(
                  PreferenceNames.WorkspaceArtifactSharingMode,
                  value as WorkspaceArtifactSharingMode,
                )
              }
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                {Object.values(WorkspaceArtifactSharingMode).map((value) => (
                  <Select.Item value={value} key={value}>
                    {t(workspaceArtifactSharingModeToI18n[value])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
          <FeynoteCardItem>
            <FeynoteCardItemLabel>
              {t('settings.workspace.referenceSearchAcrossAll')}
            </FeynoteCardItemLabel>
            <Switch
              checked={getPreference(
                PreferenceNames.ReferenceSearchAcrossAllWorkspaces,
              )}
              onCheckedChange={(checked) =>
                setPreference(
                  PreferenceNames.ReferenceSearchAcrossAllWorkspaces,
                  checked,
                )
              }
            />
          </FeynoteCardItem>
          <FeynoteCardItem>
            {t('settings.collaborationColor')}
            <Select.Root
              value={collaborationColorValue}
              onValueChange={(value) => {
                let color = value;
                if (color === 'random') {
                  color = getRandomColor();
                }
                setPreference(PreferenceNames.CollaborationColor, color);
              }}
            >
              <Select.Trigger variant="ghost" style={{ marginLeft: 'auto' }} />
              <Select.Content>
                <Select.Item value="random">
                  {t('settings.collaborationColor.random')}
                </Select.Item>
                {Object.entries(colorOptions).map(([color, i18nCode]) => (
                  <Select.Item value={color} key={color}>
                    {t(i18nCode)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FeynoteCardItem>
        </FeynoteCard>
        <VersionText>
          {t('settings.version', {
            version: import.meta.env.VITE_APP_VERSION,
          })}
        </VersionText>
      </PaneContent>
      <ActionDialog
        title={t('settings.liveExport.bulkExport.confirmTitle')}
        description={
          <>
            {t('settings.liveExport.bulkExport.confirm')}{' '}
            <a
              href="https://docs.feynote.com/docs/settings/live-export"
              target="_blank"
              rel="noreferrer"
            >
              {t('settings.liveExport.readMore')}
            </a>
          </>
        }
        open={!!liveExportPendingPath}
        onOpenChange={(open) => {
          if (!open) setLiveExportPendingPath(null);
        }}
        actionButtons={[
          {
            title: t('generic.cancel'),
            props: { color: 'gray' },
          },
          {
            title: t('generic.confirm'),
            props: { onClick: confirmBulkExport },
          },
        ]}
      />
      {liveExportProgress && (
        <ProgressBarDialog
          title={t('settings.liveExport.bulkExport.confirmTitle')}
          message={t('settings.liveExport.bulkExport.progress', {
            current: liveExportProgress.current,
            total: liveExportProgress.total,
          })}
          progress={
            liveExportProgress.total > 0
              ? liveExportProgress.current / liveExportProgress.total
              : 0
          }
        />
      )}
      <ActionDialog
        title={t('settings.liveExport.bulkExport.confirmTitle')}
        description={t('settings.liveExport.bulkExport.complete')}
        open={liveExportComplete}
        onOpenChange={(open) => {
          if (!open) setLiveExportComplete(false);
        }}
        actionButtons="okay"
      />
    </PaneContentContainer>
  );
};
