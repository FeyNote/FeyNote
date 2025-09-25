import { useSidemenuContext } from '../../context/sidemenu/SidemenuContext';

export const RightSideMenu: React.FC = () => {
  const { sidemenuContentRef } = useSidemenuContext();

  return <div ref={sidemenuContentRef}></div>;
};
