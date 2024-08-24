import { ReactNode, useMemo, useReducer, useRef } from 'react';
import { PaneTitleContext } from './PaneTitleContext';

interface Props {
  children: ReactNode;
}

export const PaneTitleContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const paneTitlesRef = useRef<Map<string, string>>(new Map());
  const paneTitles = paneTitlesRef.current;

  const getPaneTitle = (paneId: string) => {
    return paneTitles.get(paneId);
  };

  const setPaneTitle = (paneId: string, title: string) => {
    paneTitles.set(paneId, title);

    triggerRerender();
  };

  const value = useMemo(
    () => ({
      getPaneTitle,
      setPaneTitle,
    }),
    [_rerenderReducerValue],
  );

  return (
    <PaneTitleContext.Provider value={value}>
      {children}
    </PaneTitleContext.Provider>
  );
};
