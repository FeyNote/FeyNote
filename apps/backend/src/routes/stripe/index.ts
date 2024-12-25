import express from 'express';
import { stripeWebhookHandler } from './stripeWebhook';

const stripeRouter = express.Router();

stripeRouter.post('/webhook', ...stripeWebhookHandler);

export { stripeRouter };
