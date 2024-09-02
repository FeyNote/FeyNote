import { useContext } from 'react';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';

export const RightSideMenu: React.FC = () => {
  const { sidemenuContentRef } = useContext(SidemenuContext);

  return <div ref={sidemenuContentRef}></div>;
};
