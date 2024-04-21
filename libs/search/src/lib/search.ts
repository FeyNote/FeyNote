import { TypeSense } from './typesense';
import { AvailableSearchProviders, SearchProvider } from './types';

const getSearchProvider = () => {
  let searchProvider: SearchProvider | undefined;
  switch (process.env['SEARCH_PROVIDER']) {
    case AvailableSearchProviders.Typesense: {
      searchProvider = new TypeSense();
      break;
    }
  }

  if (!searchProvider)
    throw new Error(
      'SEARCH_PROVIDER must be set to "elasticsearch" or "typesense".',
    );
  return searchProvider;
};

const searchProvider = getSearchProvider();

export { searchProvider };
