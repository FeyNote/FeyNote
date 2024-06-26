import { SupportedFontSize } from '@feynote/shared-utils';

export const setFontSize = (fontSize: SupportedFontSize) => {
  window.document.documentElement.style.fontSize = fontSize;
};
