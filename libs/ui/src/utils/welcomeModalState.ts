export const setWelcomeModalPending = (state: boolean) => {
  localStorage.setItem('welcomeModalPending', JSON.stringify(state));
};

export const getWelcomeModalPending = (): boolean => {
  const state = localStorage.getItem('welcomeModalPending');
  return state ? JSON.parse(state) : false;
};
