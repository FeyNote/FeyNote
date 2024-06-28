const apiUrlsByEnv = {
  development: {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'feynote.com': {
    trpc: 'https://api.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.feynote.com',
  },
  'beta.feynote.com': {
    trpc: 'https://api.beta.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.beta.feynote.com',
  },
  'staging.feynote.com': {
    trpc: 'https://api.staging.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.staging.feynote.com',
  },
};

export const getApiUrls = () => {
  if (import.meta.env.VITE_ENVIRONMENT === 'development') {
    return apiUrlsByEnv.development;
  }

  const hostName = window.location.host;
  if (hostName in apiUrlsByEnv) {
    return apiUrlsByEnv[hostName as keyof typeof apiUrlsByEnv];
  }

  throw new Error('Unsupported host configuration: ' + hostName);
};
