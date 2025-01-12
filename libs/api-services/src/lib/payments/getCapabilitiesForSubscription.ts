import {
  SUBSCRIPTION_MODELS,
  SubscriptionModelName,
} from '@feynote/shared-utils';

export const getCapabilitiesForSubscription = (
  subscriptionName: SubscriptionModelName,
) => {
  return SUBSCRIPTION_MODELS[subscriptionName].capabilities;
};
