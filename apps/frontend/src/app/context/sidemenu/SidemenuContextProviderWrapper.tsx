import { useMemo, useState } from 'react';
import { SidemenuContext } from './SidemenuContext';
import { EmptySideMenu } from '../../components/pane/EmptySideMenu';

interface Props {
  children: React.ReactNode;
}

export const SidemenuContextProviderWrapper: React.FC<Props> = (props) => {
  const [contents, _setContents] = useState<React.ReactNode>(<EmptySideMenu />);
  const [paneId, setPaneId] = useState<string>();

  const setContents = (contents: React.ReactNode, paneId: string) => {
    _setContents(contents);
    setPaneId(paneId);
  };

  const value = useMemo(
    () => ({
      contents,
      setContents,
      paneId,
    }),
    [contents, paneId],
  );

  return (
    <SidemenuContext.Provider value={value}>
      {props.children}
    </SidemenuContext.Provider>
  );
};
