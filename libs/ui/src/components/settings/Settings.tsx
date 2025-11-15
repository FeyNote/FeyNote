import {
  AppTheme,
  ArtifactReferenceExistingArtifactSharingMode,
  ArtifactReferenceNewArtifactSharingMode,
  PreferenceNames,
  PreferencesSync,
  SupportedFontSize,
  SupportedLanguages,
} from '@feynote/shared-utils';
import {
  IonCard,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/react';
import { t } from 'i18next';
import { useMemo } from 'react';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import styled from 'styled-components';
import { getRandomColor } from '../../utils/getRandomColor';
import { PaneNav } from '../pane/PaneNav';
import { help, person, tv } from 'ionicons/icons';
import { useSessionContext } from '../../context/session/SessionContext';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { DebugDump } from './DebugDump';
import { useAlertContext } from '../../context/alert/AlertContext';

// Generally not a great idea to override Ionic styles, but this is the only option I could find
const FontSizeSelectOption = styled(IonSelectOption)<{
  $fontSize: string;
}>`
  .alert-radio-label.sc-ion-alert-md {
    font-size: ${(props) => props.$fontSize} !important;
  }
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
  const { session } = useSessionContext();
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
    <IonPage>
      <PaneNav title={t('settings.title')} />
      <IonContent>
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonIcon icon={help} size="small" />
              &nbsp;&nbsp;
              {t('settings.help')}
            </IonListHeader>
            <IonItem
              lines="none"
              href="https://docs.feynote.com"
              target="_blank"
              detail={true}
            >
              {t('settings.help.docs')}
            </IonItem>
            <IonItem
              lines="none"
              href="https://discord.gg/Tz8trXrd4C"
              target="_blank"
              detail={true}
            >
              {t('settings.help.contact')}
            </IonItem>
            <DebugDump>
              <IonItem lines="none" button detail={true}>
                {t('settings.help.debugDownload')}
              </IonItem>
            </DebugDump>
          </IonList>
        </IonCard>
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonIcon icon={person} size="small" />
              &nbsp;&nbsp;
              <IonLabel>
                {t('settings.account')}
                <p>
                  {t('settings.email.current', {
                    email: session.email,
                  })}
                </p>
              </IonLabel>
            </IonListHeader>
            <IonItem
              lines="none"
              button
              onClick={() => {
                navigate(PaneableComponent.Import, {}, PaneTransition.Push);
              }}
              target="_blank"
              detail={true}
            >
              {t('settings.import')}
            </IonItem>
            <IonItem
              lines="none"
              button
              onClick={() => {
                navigate(PaneableComponent.Export, {}, PaneTransition.Push);
              }}
              target="_blank"
              detail={true}
            >
              {t('settings.export')}
            </IonItem>
            <IonItem lines="none" button>
              <IonToggle
                checked={
                  getPreference(PreferenceNames.PreferencesSync) ===
                  PreferencesSync.Enabled
                }
                onIonChange={(event) =>
                  togglePreferencesSync(event.detail.checked)
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.preferencesSync')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem
              lines="none"
              onClick={triggerResetEmail}
              detail={true}
              button
            >
              <IonLabel>{t('settings.resetEmail')}</IonLabel>
            </IonItem>
            <IonItem
              lines="none"
              onClick={triggerResetPassword}
              detail={true}
              button
            >
              <IonLabel>{t('settings.resetPassword')}</IonLabel>
            </IonItem>
          </IonList>
        </IonCard>
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonIcon icon={tv} size="small" />
              &nbsp;&nbsp;
              {t('settings.interface')}
            </IonListHeader>
            <IonItem lines="none" button>
              <IonToggle
                checked={getPreference(PreferenceNames.PanesRememberOpenState)}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.PanesRememberOpenState,
                    event.detail.checked,
                  )
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.panesRememberOpenState')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem lines="none" button>
              <IonToggle
                checked={getPreference(PreferenceNames.LeftPaneStartOpen)}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.LeftPaneStartOpen,
                    event.detail.checked,
                  )
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.leftSideMenu')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem lines="none" button>
              <IonToggle
                checked={getPreference(PreferenceNames.RightPaneStartOpen)}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.RightPaneStartOpen,
                    event.detail.checked,
                  )
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.rightSideMenu')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem lines="none" button>
              <IonToggle
                checked={getPreference(
                  PreferenceNames.LeftPaneShowArtifactTree,
                )}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.LeftPaneShowArtifactTree,
                    event.detail.checked,
                  )
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.leftSideMenuShowArtifactTree')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem lines="none" button>
              <IonToggle
                checked={getPreference(
                  PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate,
                )}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate,
                    event.detail.checked,
                  )
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.leftSideMenuArtifactTreeAutoExpandOnNavigate')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem lines="none" button>
              <IonToggle
                checked={getPreference(
                  PreferenceNames.LeftPaneArtifactTreeShowUncategorized,
                )}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.LeftPaneArtifactTreeShowUncategorized,
                    event.detail.checked,
                  )
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.leftSideMenuArtifactTreeShowUncategorized')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem lines="none" button>
              <IonToggle
                checked={getPreference(
                  PreferenceNames.LeftPaneShowRecentThreads,
                )}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.LeftPaneShowRecentThreads,
                    event.detail.checked,
                  )
                }
              >
                <IonLabel class="ion-text-wrap">
                  {t('settings.leftSideMenuShowRecentThreads')}
                </IonLabel>
              </IonToggle>
            </IonItem>
            <IonItem lines="none">
              <IonSelect
                label={t('settings.language')}
                labelPlacement="stacked"
                value={getPreference(PreferenceNames.Language) || 'navigator'}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.Language,
                    event.detail.value === 'navigator'
                      ? null
                      : event.detail.value,
                  )
                }
              >
                <IonSelectOption value={'navigator'} key={'navigator'}>
                  {t('settings.language.default')}
                </IonSelectOption>
                {languageOptions.map((languageOption) => (
                  <IonSelectOption
                    value={languageOption[0]}
                    key={languageOption[0]}
                  >
                    {languageOption[1]}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonSelect
                label={t('settings.theme')}
                labelPlacement="stacked"
                value={getPreference(PreferenceNames.Theme)}
                onIonChange={(event) =>
                  setPreference(PreferenceNames.Theme, event.detail.value)
                }
              >
                {Object.values(AppTheme).map((theme) => (
                  <IonSelectOption value={theme} key={theme}>
                    {t(themeToI18n[theme])}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonSelect
                label={t('settings.fontSize')}
                labelPlacement="stacked"
                value={getPreference(PreferenceNames.FontSize)}
                onIonChange={(event) =>
                  setPreference(PreferenceNames.FontSize, event.detail.value)
                }
              >
                {Object.values(SupportedFontSize).map((fontSize) => (
                  <FontSizeSelectOption
                    value={fontSize}
                    key={fontSize}
                    $fontSize={fontSize}
                  >
                    {t(fontSizeToI18n[fontSize])}
                  </FontSizeSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonList>
        </IonCard>
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonIcon icon={tv} size="small" />
              &nbsp;&nbsp;
              {t('settings.editor')}
            </IonListHeader>
            <IonItem lines="none">
              <IonSelect
                label={t('settings.artifact.referenceNewArtifactSharingMode')}
                labelPlacement="stacked"
                value={getPreference(
                  PreferenceNames.ArtifactReferenceNewArtifactSharingMode,
                )}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.ArtifactReferenceNewArtifactSharingMode,
                    event.detail.value,
                  )
                }
              >
                {Object.values(ArtifactReferenceNewArtifactSharingMode).map(
                  (value) => (
                    <IonSelectOption value={value} key={value}>
                      {t(artifactReferenceNewArtifactSharingModeToI18n[value])}
                    </IonSelectOption>
                  ),
                )}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonSelect
                label={t(
                  'settings.artifact.referenceExistingArtifactSharingMode',
                )}
                labelPlacement="stacked"
                value={getPreference(
                  PreferenceNames.ArtifactReferenceExistingArtifactSharingMode,
                )}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.ArtifactReferenceExistingArtifactSharingMode,
                    event.detail.value,
                  )
                }
              >
                {Object.values(
                  ArtifactReferenceExistingArtifactSharingMode,
                ).map((value) => (
                  <IonSelectOption value={value} key={value}>
                    {t(
                      artifactReferenceExistingArtifactSharingModeToI18n[value],
                    )}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonSelect
                label={t('settings.collaborationColor')}
                labelPlacement="stacked"
                value={collaborationColorValue}
                onIonChange={(event) => {
                  let value = event.detail.value;
                  if (value === 'random') {
                    value = getRandomColor();
                  }
                  setPreference(PreferenceNames.CollaborationColor, value);
                }}
                interfaceOptions={{
                  cssClass: 'color-select-popover',
                }}
              >
                <IonSelectOption value={'random'}>
                  {t('settings.collaborationColor.random')}
                </IonSelectOption>
                {Object.entries(colorOptions).map(([color, i18nCode]) => (
                  <IonSelectOption value={color} key={color}>
                    {t(i18nCode)}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonList>
        </IonCard>
        <br />
        <IonItem>
          <IonLabel>
            <p>
              {t('settings.version', {
                version: import.meta.env.VITE_APP_VERSION,
              })}
            </p>
          </IonLabel>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};
