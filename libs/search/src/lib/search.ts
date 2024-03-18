import { ElasticSearch } from './elasticSearch';
import { AvailableSearchProviders, SearchProvider } from './types';

const getSearchProvider = () => {
  let searchProvider: SearchProvider | undefined;
  switch (process.env['SEARCH_PROVIDER']) {
    case AvailableSearchProviders.ElasticSearch: {
      searchProvider = new ElasticSearch();
      break;
    }
  }

  if (!searchProvider)
    throw new Error('SEARCH_PROVIDER must be set to "elasticsearch".');
  return searchProvider;
};

const searchProvider = getSearchProvider();

export { searchProvider };
