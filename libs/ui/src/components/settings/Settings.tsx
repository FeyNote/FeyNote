import {
  AppTheme,
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
  useIonAlert,
  useIonModal,
} from '@ionic/react';
import { t } from 'i18next';
import { useContext, useMemo } from 'react';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import styled from 'styled-components';
import { getRandomColor } from '../../utils/getRandomColor';
import { PaneNav } from '../pane/PaneNav';
import { help, person, tv } from 'ionicons/icons';
import { SessionContext } from '../../context/session/SessionContext';
import { WelcomeModal } from '../dashboard/WelcomeModal';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

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
  const [presentAlert] = useIonAlert();
  const { setPreference, getPreference, _preferencesService } =
    useContext(PreferencesContext);
  const { session } = useContext(SessionContext);
  const { navigate } = useContext(PaneContext);
  const [presentWelcomeModal, dismissWelcomeModal] = useIonModal(WelcomeModal, {
    dismiss: () => dismissWelcomeModal(),
  });

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
    presentAlert({
      header: t('settings.preferencesSync.header'),
      message: t('settings.preferencesSync.message'),
      buttons: [
        {
          text: t('generic.cancel'),
          handler: () => {
            window.location.reload();
          },
        },
        {
          text: t('settings.preferencesSync.local'),
          handler: () => {
            setPreference(PreferenceNames.PreferencesSync, value);
          },
        },
        {
          text: t('settings.preferencesSync.remote'),
          handler: () => {
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
      ],
    });
  };

  const collaborationColorValue = Object.keys(colorOptions).includes(
    getPreference(PreferenceNames.CollaborationColor),
  )
    ? getPreference(PreferenceNames.CollaborationColor)
    : 'random';

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
              href="https://feynote.com/documentation"
              target="_blank"
              detail={true}
            >
              {t('settings.help.docs')}
            </IonItem>
            <IonItem
              lines="none"
              button
              detail={true}
              onClick={() => presentWelcomeModal()}
            >
              {t('settings.help.welcome')}
            </IonItem>
            <IonItem
              lines="none"
              href="https://discord.gg/Tz8trXrd4C"
              target="_blank"
              detail={true}
            >
              {t('settings.help.contact')}
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
            <IonItem
              lines="none"
              button
              onClick={() => {
                navigate(
                  PaneableComponent.JobDashboard,
                  {},
                  PaneTransition.Push,
                );
              }}
              target="_blank"
              detail={true}
            >
              {t('settings.importExport')}
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
        <IonCard>
          <IonList>
            <IonListHeader>
              <IonIcon icon={person} size="small" />
              &nbsp;&nbsp;
              {t('settings.account')}
            </IonListHeader>
            <IonItem lines="none" button>
              <IonLabel>
                {t('settings.email')}
                <p>
                  {t('settings.email.current')} {session.email}
                </p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none" button>
              <IonLabel>{t('settings.password')}</IonLabel>
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
