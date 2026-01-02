import { Capability } from '@feynote/shared-utils';
import { getCapabilitiesForUser } from '../payments/getCapabilitiesForUser';

export const getFileLimitsForUser = async (userId: string) => {
  const userCapabilities = await getCapabilitiesForUser(userId);
  let maxResolution = 1024;
  let quality = 70;
  if (userCapabilities.has(Capability.HighResImages)) {
    maxResolution = 2048;
    quality = 70;
  }
  if (userCapabilities.has(Capability.UltraHighResImages)) {
    maxResolution = 4096;
    quality = 75;
  }

  let maxFileSizeMb = 5;
  if (userCapabilities.has(Capability.LargeFiles)) {
    maxFileSizeMb = 25;
  }
  if (userCapabilities.has(Capability.UltraLargeFiles)) {
    maxFileSizeMb = 50;
  }

  return {
    maxResolution,
    quality,
    maxFileSize: maxFileSizeMb * 1024 * 1024, // convert to bytes
  };
};
