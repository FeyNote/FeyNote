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

function assertCheckoutFieldWithSentryLog<T>(
  property: T,
  propertyName: string,
  extra: Record<string, any> = {},
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
console.log('baapbapp', globalServerConfig.stripe.webhookSecret);

export const stripeWebhookHandler = defineExpressHandler(
  {
    schema,
    authentication: AuthenticationEnforcement.None,
  },
  async (req) => {
    console.log('got webhook', globalServerConfig.stripe.webhookSecret);
    const stripeSignature = req.headers['stripe-signature'];
    if (!stripeSignature) {
      Sentry.captureMessage(
        'Stripe webhook request made with missing stripe-signature header',
      );
      throw new BadRequestExpressError('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        (req as any).rawBody,
        stripeSignature,
        globalServerConfig.stripe.webhookSecret,
      );
    } catch (e) {
      console.error('Stripe webhook validation error', e);
      Sentry.captureException(e);
      throw new BadRequestExpressError(`Webhook Error: ${e}`);
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;

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

      const paymentIntentId =
        typeof invoice.payment_intent === 'string'
          ? invoice.payment_intent
          : invoice.payment_intent?.id;
      assertCheckoutFieldWithSentryLog(paymentIntentId, 'paymentIntentId', {
        type: event.type,
        stripeInvoice: invoice,
      });

      const subscriptionId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
      assertCheckoutFieldWithSentryLog(subscriptionId, 'subscriptionId', {
        type: event.type,
        stripeInvoice: invoice,
      });

      await prisma.$transaction(async (tx) => {
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
            customerEmail: invoice.customer_email,
            paymentIntentId,
            stripeSubscriptionId: subscriptionId,
            subscriptionId: internalSubscription?.id,
            eventObjectJson: invoice as any,
          },
        });

        const subscriptionModelNames = invoice.lines.data
          .map((lineItem) => lineItem.plan?.metadata?.name)
          .filter((priceName): priceName is string => Boolean(priceName));

        if (subscriptionModelNames.length === 0) {
          Sentry.captureMessage('No subscription model found in paid invoice', {
            extra: {
              type: event.type,
              stripeInvoice: invoice,
            },
          });
        }

        if (userId) {
          for (const priceName of subscriptionModelNames) {
            await extendSubscription({
              userId,
              priceName,
              tx,
            });
          }
        } else {
          Sentry.captureMessage('Payment collected for unknown user', {
            extra: {
              type: event.type,
              stripeInvoice: invoice,
            },
          });
        }
      });
    }

    return {
      statusCode: 200,
      data: {
        received: true,
      },
    };
  },
);
