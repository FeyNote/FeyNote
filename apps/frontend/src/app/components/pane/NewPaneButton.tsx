import { IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useContext } from 'react';
import { GlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import {
  PaneableComponent,
  paneableComponentNameToDefaultI18nTitle,
} from '../../context/globalPane/PaneableComponent';
import { Actions, DockLocation } from 'flexlayout-react';
import { useTranslation } from 'react-i18next';

interface Props {
  tabsetId: string;
}

export const NewPaneButton: React.FC<Props> = (props) => {
  const { _model } = useContext(GlobalPaneContext);
  const { t } = useTranslation();

  const newTab = () => {
    const id = crypto.randomUUID();
    _model.doAction(
      Actions.addNode(
        {
          id,
          type: 'tab',
          component: id,
          name: t(
            paneableComponentNameToDefaultI18nTitle[
              PaneableComponent.Dashboard
            ],
          ),
          config: {
            component: PaneableComponent.Dashboard,
            props: {},
            navigationEventId: crypto.randomUUID(),
          },
        },
        props.tabsetId,
        DockLocation.CENTER,
        -1,
        true,
      ),
    );
  };

  return (
    <IonButton
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={newTab}
      size="small"
      fill="clear"
    >
      <IonIcon icon={add} size="small" slot="icon-only" />
    </IonButton>
  );
};
