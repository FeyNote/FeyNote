export const getIsViteDevelopment = () => {
  try {
    // MODE/VITE_ENVIRONMENT can be different in astro or vite
    return (
      import.meta.env.MODE === 'development' ||
      import.meta.env.VITE_ENVIRONMENT === 'development'
    );
  } catch (_e) {
    return false;
  }
};
