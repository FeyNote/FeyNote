import { getCapabilitiesForUser } from './getCapabilitiesForUser';
import { Capability } from '@feynote/shared-utils';

export const getUserHasCapability = async (
  userId: string,
  capability: Capability,
) => {
  const capabilities = await getCapabilitiesForUser(userId);
  return capabilities.includes(capability);
};
