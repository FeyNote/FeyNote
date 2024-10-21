import { getIsViteDevelopment } from './getIsViteDevelopment';

let wsHost = '';
try {
  // We reference self here so that we're service-worker compatible
  // eslint-disable-next-line no-restricted-globals
  wsHost = `${self.location.protocol === 'https:' ? 'wss' : 'ws'}://${self.location.host}`;
} catch (e) {
  // Do nothing, window is not available in all environments
}

const apiUrlsByEnv = {
  development: {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
    websocket: wsHost + '/websocket',
  },
  'feynote.com': {
    trpc: 'https://feynote.com/api/trpc',
    hocuspocus: 'https://feynote.com/hocuspocus',
    websocket: 'wss://feynote.com/websocket',
  },
  'app.feynote.com': {
    trpc: 'https://app.feynote.com/api/trpc',
    hocuspocus: 'https://app.feynote.com/hocuspocus',
    websocket: 'wss://app.feynote.com/websocket',
  },
  'beta.feynote.com': {
    trpc: 'https://beta.feynote.com/api/trpc',
    hocuspocus: 'https://beta.feynote.com/hocuspocus',
    websocket: 'wss://beta.feynote.com/websocket',
  },
  'app.beta.feynote.com': {
    trpc: 'https://app.beta.feynote.com/api/trpc',
    hocuspocus: 'https://app.beta.feynote.com/hocuspocus',
    websocket: 'wss://app.beta.feynote.com/websocket',
  },
  'staging.feynote.com': {
    trpc: 'https://staging.feynote.com/api/trpc',
    hocuspocus: 'https://staging.feynote.com/hocuspocus',
    websocket: 'wss://staging.feynote.com/websocket',
  },
  'app.staging.feynote.com': {
    trpc: 'https://app.staging.feynote.com/api/trpc',
    hocuspocus: 'https://app.staging.feynote.com/hocuspocus',
    websocket: 'wss://app.staging.feynote.com/websocket',
  },
};

export const getApiUrls = () => {
  if (getIsViteDevelopment()) {
    return apiUrlsByEnv.development;
  }

  // We reference self here so that we're service-worker compatible
  // eslint-disable-next-line no-restricted-globals
  const hostName = self.location.host;
  if (hostName in apiUrlsByEnv) {
    return apiUrlsByEnv[hostName as keyof typeof apiUrlsByEnv];
  }

  throw new Error('Unsupported host configuration: ' + hostName);
};
