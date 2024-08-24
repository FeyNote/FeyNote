import { useContext } from 'react';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';

export const RightSideMenu: React.FC = () => {
  const { contents } = useContext(SidemenuContext);

  return contents;
};
