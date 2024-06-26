import { AppTheme } from '@feynote/shared-utils';

export const setAppTheme = (theme: AppTheme) => {
  const bodyClasses = document.body.className.replace(/theme-\S*/, '');
  document.body.className = `${bodyClasses} theme-${theme}`;
};
