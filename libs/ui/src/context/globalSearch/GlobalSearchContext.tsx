import { createContext, useContext } from 'react';

interface GlobalSearchContextData {
  trigger: () => void;
}

export const GlobalSearchContext =
  createContext<GlobalSearchContextData | null>(null);

export const useGlobalSearchContext = () => {
  const val = useContext(GlobalSearchContext);

  if (!val) {
    throw new Error(
      'GlobalSearchContext used within component that does not inherit from GlobalSearchContextProvider',
    );
  }

  return val;
};
