import { IconButton } from '@radix-ui/themes';
import { IoAdd } from '../AppIcons';
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
    <IconButton
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={newTab}
      variant="ghost"
      size="1"
    >
      <IoAdd size={18} />
    </IconButton>
  );
};
