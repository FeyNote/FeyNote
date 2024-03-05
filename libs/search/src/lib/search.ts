import { ElasticSearch } from './elasticSearch';
import { MeiliSearch } from './meilisearch';
import { AvailableSearchProviders, SearchProvider } from './types';

let searchProvider: SearchProvider | undefined;
switch (process.env['SEARCH_PROVIDER']) {
  case AvailableSearchProviders.ElasticSearch: {
    searchProvider = new ElasticSearch();
    break;
  }
  case AvailableSearchProviders.MeiliSearch: {
    searchProvider = new MeiliSearch();
    break;
  }
  default: {
    throw new Error('SEARCH_PROVIDER must be set to "elasticsearch".');
  }
}

export const searchArtifacts = searchProvider.searchArtifacts;
export const indexArtifacts = searchProvider.indexArtifacts;
export const deleteArtifacts = searchProvider.deleteArtifacts;
