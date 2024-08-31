import { IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useContext } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

interface Props {
  tabsetId: string;
}

export const NewPaneButton: React.FC<Props> = (props) => {
  const { navigate, getSelectedTabForTabset } = useContext(GlobalPaneContext);

  const newTab = () => {
    navigate(
      getSelectedTabForTabset(props.tabsetId).getId(),
      PaneableComponent.Dashboard,
      {},
      PaneTransition.NewTab,
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
