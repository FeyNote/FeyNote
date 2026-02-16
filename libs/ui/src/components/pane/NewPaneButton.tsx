import { IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useGlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import { createNewTab } from '../../utils/createNewTab';

interface Props {
  tabsetId: string;
}

export const NewPaneButton: React.FC<Props> = (props) => {
  const { _model } = useGlobalPaneContext();

  const newTab = () => {
    createNewTab(_model, props.tabsetId);
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
