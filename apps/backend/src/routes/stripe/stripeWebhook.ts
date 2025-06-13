import * as Sentry from '@sentry/node';
import Stripe from 'stripe';

import {
  AuthenticationEnforcement,
  defineExpressHandler,
  BadRequestExpressError,
  stripe,
  getCheckoutUserId,
  extendSubscription,
} from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';
import { globalServerConfig } from '@feynote/config';

const STRIPE_PRICE_CACHE_TTL_MINUTES = 10;
let stripePriceCache: Stripe.Price[] | null = null;
setInterval(
  () => {
    stripePriceCache = null;
  },
  STRIPE_PRICE_CACHE_TTL_MINUTES * 60 * 1000,
);

const getStripePrices = async () => {
  if (stripePriceCache) {
    return stripePriceCache;
  } else {
    const prices = await stripe.prices.list({
      limit: 100, // NOTE: This only supports 100 prices maximum. After that, we'll need to add support for pagination.
    });

    if (prices.has_more) {
      Sentry.captureMessage(
        "Warning: prices need to be paginated since it seems like we've created a lot of prices in stripe.",
      );
    }

    stripePriceCache = prices.data;

    return prices.data;
  }
};

function assertCheckoutFieldWithSentryLog<T>(
  property: T,
  propertyName: string,
  extra: Record<string, unknown> = {},
): asserts property is NonNullable<T> {
  if (property === null || property === undefined) {
    const message = `${propertyName} is missing on Stripe webhook object`;
    Sentry.captureMessage(message, {
      extra,
    });
    throw new BadRequestExpressError(message);
  }
}

const schema = {};

/**
 * The code in this handler is somewhat rough. There are a lot of assumptions, and the Stripe webhook API is a little ugly.
 * I didn't exactly put my best effort in here, since this has been refactored 3 times in efforts to keep up with Stripe's ever changing API.
 * I recommend not investing significant time trying to clean things up here, since it'll just change again in 3 days.
 */
export const stripeWebhookHandler = defineExpressHandler(
  {
    schema,
    authentication: AuthenticationEnforcement.None,
  },
  async function _stripeWebhookHandler(req, res) {
    const stripeSignature = req.headers['stripe-signature'];
    if (!stripeSignature) {
      Sentry.captureMessage(
        'Stripe webhook request made with missing stripe-signature header',
      );
      throw new BadRequestExpressError('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      // rawBody is a custom field added by the body-parser middleware for only this route. See the main express app file for info
      const customReq = req as unknown as { rawBody: string };
      event = await stripe.webhooks.constructEventAsync(
        customReq.rawBody,
        stripeSignature,
        globalServerConfig.stripe.webhookSecret,
      );
    } catch (e) {
      console.error('Stripe webhook validation error', e);
      Sentry.captureException(e);
      throw new BadRequestExpressError(`Webhook Error: ${e}`);
    }

    res.status(200).json({
      received: true,
    });

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const invoiceId = invoice.id;

      assertCheckoutFieldWithSentryLog(invoiceId, 'invoiceId', {
        type: event.type,
        stripeInvoice: invoice,
      });

      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;
      assertCheckoutFieldWithSentryLog(customerId, 'customerId', {
        type: event.type,
        stripeInvoice: invoice,
      });

      const userId = await getCheckoutUserId({
        customerId,
        customerEmail: invoice.customer_email || undefined,
      });

      const subscription = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subscription === 'string' ? subscription : subscription?.id;
      assertCheckoutFieldWithSentryLog(subscriptionId, 'subscriptionId', {
        type: event.type,
        stripeInvoice: invoice,
      });

      const priceIds = invoice.lines.data
        .map((lineItem) => lineItem.pricing?.price_details?.price)
        .filter((el): el is string => Boolean(el));

      if (priceIds.length === 0) {
        console.error('No subscription model found in paid invoice');
        Sentry.captureMessage('No subscription model found in paid invoice', {
          extra: {
            type: event.type,
            stripeInvoice: invoice,
          },
        });
      }

      const prices = await getStripePrices();
      const pricesById = new Map(prices.map((el) => [el.id, el]));

      const priceNames = priceIds.map((priceId) => {
        const name = pricesById.get(priceId)?.metadata.name;
        if (!name) {
          Sentry.captureMessage('Collected payment for unknown price', {
            extra: {
              priceId,
            },
          });
        }
        return name;
      });

      await prisma.$transaction(async (tx) => {
        if (userId) {
          for (const priceName of priceNames) {
            if (priceName === undefined) {
              continue;
            }

            await extendSubscription({
              userId,
              priceName,
              stripeSubscriptionId: subscriptionId,
              tx,
            });
          }
        } else {
          console.error('Payment collected for unknown user');
          Sentry.captureMessage('Payment collected for unknown user', {
            extra: {
              type: event.type,
              stripeInvoice: invoice,
            },
          });
        }

        const internalSubscription = await tx.subscription.findUnique({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
        });

        await tx.stripePayment.create({
          data: {
            userId,
            amountPaid: invoice.amount_paid,
            customerId,
            invoiceId,
            customerEmail: invoice.customer_email,
            stripeSubscriptionId: subscriptionId,
            subscriptionId: internalSubscription?.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stripe's typings are incompatible with Prisma's troublesome json type
            eventObjectJson: invoice as any,
          },
        });
      });
    }

    return undefined;
  },
);
