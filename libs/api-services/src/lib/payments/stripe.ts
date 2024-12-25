import { globalServerConfig } from '@feynote/config';
import Stripe from 'stripe';

export const stripe = new Stripe(globalServerConfig.stripe.apiKey, {
  apiVersion: '2024-12-18.acacia',
  maxNetworkRetries: 3,
});
