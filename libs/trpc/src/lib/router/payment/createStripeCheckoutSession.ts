import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import * as Sentry from '@sentry/node';

import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { stripe } from '@feynote/api-services';
import { SubscriptionModelName } from '@feynote/shared-utils';

export const createStripeCheckoutSession = authenticatedProcedure
  .input(
    z.object({
      subscriptionModelName: z.nativeEnum(SubscriptionModelName),
      successUrl: z.string(),
      cancelUrl: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
      url: string;
    }> => {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.userId,
        },
        select: {
          email: true,
          stripeCustomerId: true,
        },
      });

      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
        });

        await prisma.user.update({
          where: {
            id: ctx.session.userId,
          },
          data: {
            stripeCustomerId: stripeCustomer.id,
          },
        });

        stripeCustomerId = stripeCustomer.id;
      }

      const prices = await stripe.prices.search({
        query: `metadata["name"]:"${input.subscriptionModelName}"`,
      });

      const price = prices.data.at(0);
      if (!price) {
        Sentry.captureMessage('Price not found', {
          extra: {
            productName: input.subscriptionModelName,
            prices,
          },
        });
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Price not found',
        });
      }

      if (prices.data.length > 1) {
        Sentry.captureMessage('Multiple prices found for product', {
          extra: {
            productName: input.subscriptionModelName,
            prices,
          },
        });
      }

      const stripeCheckoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId || undefined,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
      });

      if (!stripeCheckoutSession.url) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe session URL not found',
        });
      }

      return {
        id: stripeCheckoutSession.id,
        url: stripeCheckoutSession.url,
      };
    },
  );
