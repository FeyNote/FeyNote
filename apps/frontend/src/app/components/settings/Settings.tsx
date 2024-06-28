import {
  AppTheme,
  PreferenceNames,
  PreferencesSync,
  SupportedFontSize,
  SupportedLanguages,
} from '@feynote/shared-utils';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react';
import { t } from 'i18next';
import { useContext, useMemo } from 'react';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import styled from 'styled-components';

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

export const Settings: React.FC = () => {
  const [presentAlert] = useIonAlert();
  const { setPreference, getPreference, _preferencesService } =
    useContext(PreferencesContext);
  const showSplitPaneOption = window.innerWidth >= 1200;

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
    } catch (e) {
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

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('settings.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonListHeader>{t('settings.interface')}</IonListHeader>
          {showSplitPaneOption && (
            <IonItem>
              <IonToggle
                checked={getPreference(PreferenceNames.EnableSplitPane)}
                onIonChange={(event) =>
                  setPreference(
                    PreferenceNames.EnableSplitPane,
                    event.detail.checked,
                  )
                }
              >
                {t('settings.sideMenu')}
              </IonToggle>
            </IonItem>
          )}
          <IonItem>
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
          <IonItem>
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
          <IonItem>
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
        <br />
        <IonList>
          <IonListHeader>{t('settings.account')}</IonListHeader>
          <IonItem button>
            <IonLabel>{t('settings.email')}</IonLabel>
          </IonItem>
          <IonItem button>
            <IonLabel>{t('settings.password')}</IonLabel>
          </IonItem>
          <IonItem>
            <IonToggle
              checked={
                getPreference(PreferenceNames.PreferencesSync) ===
                PreferencesSync.Enabled
              }
              onIonChange={(event) =>
                togglePreferencesSync(event.detail.checked)
              }
            >
              {t('settings.preferencesSync')}
            </IonToggle>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
