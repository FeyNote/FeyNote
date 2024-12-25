import { Capability, SubscriptionModelName } from '@feynote/shared-utils';
import { getCapabilitiesForSubscription } from './getCapabilitiesForSubscription';
import { getSubscriptionsForUser } from './getSubscriptionsForUser';

export const getCapabilitiesForUser = async (userId: string) => {
  const activeSubscriptions = await getSubscriptionsForUser(userId);

  return activeSubscriptions.reduce<Capability[]>((acc, activeSubscription) => {
    const capabilities = getCapabilitiesForSubscription(
      activeSubscription.name as SubscriptionModelName,
    );
    return [...acc, ...capabilities];
  }, []);
};
