import { createContext, useContext } from 'react';

export interface ToastDisplayOpts {
  title?: string;
  body?: string;
  actions?: {
    title: string;
    onClick: () => void;
  }[];
  showClose?: boolean;
}

export interface ToastContextData {
  showToast: (opts: ToastDisplayOpts) => void;
}

export const ToastContext = createContext<ToastContextData | null>(null);

export const useToastContext = (): ToastContextData => {
  const val = useContext(ToastContext);

  if (!val) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }

  return val;
};
