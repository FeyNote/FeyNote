import { createContext, useContext, type ComponentProps } from 'react';
import type { ActionDialog } from '../../components/sharedComponents/ActionDialog';

export interface AlertContextData {
  showAlert: (opts: ComponentProps<typeof ActionDialog>) => void;
}

export const AlertContext = createContext<AlertContextData | null>(null);

export const useAlertContext = (): AlertContextData => {
  const val = useContext(AlertContext);

  if (!val) {
    throw new Error('useAlertContext must be used within a AlertProvider');
  }

  return val;
};
