import { Capability, SubscriptionModelName } from '@feynote/shared-utils';
import { getCapabilitiesForSubscription } from './getCapabilitiesForSubscription';
import { getSubscriptionsForUser } from './getSubscriptionsForUser';

export const getCapabilitiesForUser = async (userId: string) => {
  const activeSubscriptions = await getSubscriptionsForUser(userId);

  const capabilities = activeSubscriptions.reduce<Set<Capability>>(
    (acc, activeSubscription) => {
      const capabilities = getCapabilitiesForSubscription(
        activeSubscription.name as SubscriptionModelName,
      );
      for (const capability of capabilities) {
        acc.add(capability);
      }
      return acc;
    },
    new Set(),
  );

  return capabilities;
};
