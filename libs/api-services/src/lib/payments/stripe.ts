import { globalServerConfig } from '@feynote/config';
import Stripe from 'stripe';

export const stripe = new Stripe(globalServerConfig.stripe.apiKey, {
  maxNetworkRetries: 3,
});
