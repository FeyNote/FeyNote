const apiUrlsByEnv = {
  development: {
    trpc: '/api/trpc',
    hocuspocus: '/hocuspocus',
  },
  'feynote.com': {
    trpc: 'https://api.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.feynote.com',
  },
  'app.feynote.com': {
    trpc: 'https://api.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.feynote.com',
  },
  'beta.feynote.com': {
    trpc: 'https://api.beta.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.beta.feynote.com',
  },
  'app.beta.feynote.com': {
    trpc: 'https://api.beta.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.beta.feynote.com',
  },
  'staging.feynote.com': {
    trpc: 'https://api.staging.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.staging.feynote.com',
  },
  'app.staging.feynote.com': {
    trpc: 'https://api.staging.feynote.com/trpc',
    hocuspocus: 'https://hocuspocus.staging.feynote.com',
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
