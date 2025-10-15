import { createContext, useContext, type ComponentProps } from 'react';
import type { ActionDialog } from '../../components/sharedComponents/ActionDialog';

export interface AlertContextData {
  showAlert: (opts: ComponentProps<typeof ActionDialog>) => void;
}

export const AlertContext = createContext<AlertContextData | null>(null);

/**
 * Please consider using the ActionDialog component rather than this context.
 * You should very likely be rendering your dialog local to your component and not globally.
 * This exists primarily for places that are not part of the render tree.
 */
export const useAlertContext = (): AlertContextData => {
  const val = useContext(AlertContext);

  if (!val) {
    throw new Error('useAlertContext must be used within a AlertProvider');
  }

  return val;
};
