import { Capability } from '@feynote/shared-utils';
import { getCapabilitiesForUser } from '../payments/getCapabilitiesForUser';

export const getImageQuality = async (userId: string) => {
  const userCapabilities = await getCapabilitiesForUser(
    userId,
  );
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
