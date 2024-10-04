const apiUrlsByEnv = {
  development: {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'feynote.com': {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'app.feynote.com': {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'beta.feynote.com': {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'app.beta.feynote.com': {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'staging.feynote.com': {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'app.staging.feynote.com': {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
};

export const getApiUrls = () => {
  try {
    if (
      // MODE is used by Astro
      import.meta.env.MODE === 'development' ||
      // VITE_ENVIRONMENT is used by Vite
      import.meta.env.VITE_ENVIRONMENT === 'development'
    ) {
      return apiUrlsByEnv.development;
    }
  } catch (e) {
    // Do nothing, import.meta.env is not available in all environments
  }

  // We reference self here so that we're service-worker compatible
  // eslint-disable-next-line no-restricted-globals
  const hostName = self.location.host;
  if (hostName in apiUrlsByEnv) {
    return apiUrlsByEnv[hostName as keyof typeof apiUrlsByEnv];
  }

  throw new Error('Unsupported host configuration: ' + hostName);
};
