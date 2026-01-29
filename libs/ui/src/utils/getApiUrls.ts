import { getIsViteDevelopment } from './getIsViteDevelopment';

let wsHost = '';
try {
  // We reference self here so that we're service-worker compatible
  // eslint-disable-next-line no-restricted-globals
  wsHost = `${self.location.protocol === 'https:' ? 'wss' : 'ws'}://${self.location.host}`;
} catch (_e) {
  // Do nothing, window is not available in all environments
}

const apiUrlsByEnv = {
  development: {
    // eslint-disable-next-line no-restricted-globals
    rest: self.location.origin + '/api',
    // eslint-disable-next-line no-restricted-globals
    trpc: self.location.origin + '/api/trpc',
    // eslint-disable-next-line no-restricted-globals
    hocuspocus: self.location.origin + '/hocuspocus',
    websocket: wsHost + '/websocket',
  },
  'feynote.com': {
    rest: 'https://feynote.com/api',
    trpc: 'https://feynote.com/api/trpc',
    hocuspocus: 'hocuspocus.feynote.com',
    websocket: 'wss://websocket.feynote.com',
  },
  'app.feynote.com': {
    rest: 'https://app.feynote.com/api',
    trpc: 'https://app.feynote.com/api/trpc',
    hocuspocus: 'hocuspocus.feynote.com',
    websocket: 'wss://websocket.feynote.com',
  },
  'beta.feynote.com': {
    rest: 'https://beta.feynote.com/api',
    trpc: 'https://beta.feynote.com/api/trpc',
    hocuspocus: 'hocuspocus.beta.feynote.com',
    websocket: 'wss://websocket.beta.feynote.com',
  },
  'app.beta.feynote.com': {
    rest: 'https://app.beta.feynote.com/api',
    trpc: 'https://app.beta.feynote.com/api/trpc',
    hocuspocus: 'hocuspocus.beta.feynote.com',
    websocket: 'wss://websocket.beta.feynote.com',
  },
  'staging.feynote.com': {
    rest: 'https://staging.feynote.com/api',
    trpc: 'https://staging.feynote.com/api/trpc',
    hocuspocus: 'hocuspocus.staging.feynote.com',
    websocket: 'wss://websocket.staging.feynote.com',
  },
  'app.staging.feynote.com': {
    rest: 'https://app.staging.feynote.com/api',
    trpc: 'https://app.staging.feynote.com/api/trpc',
    hocuspocus: 'hocuspocus.staging.feynote.com',
    websocket: 'wss://websocket.staging.feynote.com',
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
