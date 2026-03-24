import { SearchManager } from './SearchManager';

let searchManager: SearchManager | undefined;
export const getSearchManager = () => {
  if (searchManager) return searchManager;
  searchManager = new SearchManager();
  return searchManager;
};
