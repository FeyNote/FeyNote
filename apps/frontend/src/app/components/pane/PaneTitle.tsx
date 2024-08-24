import { useContext } from 'react';
import { PaneTitleContext } from '../../context/paneTitle/PaneTitleContext';

interface Props {
  id: string;
}

export const PaneTitle: React.FC<Props> = (props) => {
  const { getPaneTitle } = useContext(PaneTitleContext);
  const title = getPaneTitle(props.id);

  return title || '';
};
