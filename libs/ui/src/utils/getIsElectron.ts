export const getIsElectron = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      'electronAPI' in window &&
      typeof (
        window as Window & { electronAPI?: { getApiUrlsSync?: () => unknown } }
      ).electronAPI?.getApiUrlsSync === 'function'
    );
  } catch {
    return false;
  }
};
