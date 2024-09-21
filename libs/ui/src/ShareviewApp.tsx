import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.class.css';
import './css/global.css';
import { initI18Next } from './i18n/initI18Next';
import { PreferencesContextProviderWrapper } from './context/preferences/PreferencesContextProviderWrapper';
import { ArtifactShareView } from './components/sharing/sharedArtifactByToken/ArtifactShareView';

initI18Next();
setupIonicReact();

interface Props {
  id: string
}
export const ShareviewApp: React.FC<Props> = (props) => {
  return (
    <IonApp>
      <PreferencesContextProviderWrapper>
        <ArtifactShareView artifactId={props.id} />
      </PreferencesContextProviderWrapper>
    </IonApp>
  )
}
