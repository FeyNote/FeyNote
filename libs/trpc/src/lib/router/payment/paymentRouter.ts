import { router as trpcRouter } from '../../trpc';
import { createStripeCheckoutSession } from './createStripeCheckoutSession';
import { getSubscriptions } from './getSubscriptions';
import { getCapabilities } from './getCapabilities';
import { createStripeBillingPortalSession } from './createStripeBillingPortalSession';

export const paymentRouter = trpcRouter({
  createStripeCheckoutSession,
  createStripeBillingPortalSession,
  getSubscriptions,
  getCapabilities,
});
