import { getElectronAPI } from './electronAPI';

export const getIsElectron = (): boolean => {
  return !!getElectronAPI();
};
