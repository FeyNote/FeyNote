import { useMemo, useRef } from 'react';
import { SidemenuContext } from './SidemenuContext';

interface Props {
  children: React.ReactNode;
}

export const SidemenuContextProviderWrapper: React.FC<Props> = (props) => {
  const sidemenuContentRef = useRef<HTMLDivElement>(null);

  const value = useMemo(
    () => ({
      sidemenuContentRef,
    }),
    [],
  );

  return (
    <SidemenuContext.Provider value={value}>
      {props.children}
    </SidemenuContext.Provider>
  );
};
