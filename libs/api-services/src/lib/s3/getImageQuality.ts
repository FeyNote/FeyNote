import { Capability } from '@feynote/shared-utils';

export const getImageQuality = (userCapabilities: Set<Capability>) => {
  let maxResolution = 1024;
  let quality = 65;
  if (userCapabilities.has(Capability.HighResImages)) {
    maxResolution = 2048;
    quality = 75;
  }
  if (userCapabilities.has(Capability.UltraHighResImages)) {
    maxResolution = 4096;
    quality = 80;
  }
  return {
    maxResolution,
    quality,
  };
};
