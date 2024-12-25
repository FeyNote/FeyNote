import { getSubscriptionsForUser, stripe } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { SubscriptionModelName } from '@feynote/shared-utils';
import { prisma } from '@feynote/prisma/client';
import Stripe from 'stripe';

export const getSubscriptions = authenticatedProcedure.query(
  async ({
    ctx,
  }): Promise<{
    subscriptions: {
      id: string;
      name: SubscriptionModelName;
      expiresAt: Date | null;
      cancelledAt: Date | null;
      activeWithStripe: boolean;
    }[];
  }> => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session.userId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });

    if (!user.stripeCustomerId) {
      return {
        subscriptions: [],
      };
    }

    const internalSubscriptions = await getSubscriptionsForUser(user.id, true);

    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 100,
    });

    const stripeSubscriptionsById = new Map<string, Stripe.Subscription>();
    for (const subscription of stripeSubscriptions.data) {
      stripeSubscriptionsById.set(subscription.id, subscription);
    }

    return {
      subscriptions: internalSubscriptions.map((subscription) => ({
        id: subscription.id,
        name: subscription.name as SubscriptionModelName,
        expiresAt: subscription.expiresAt,
        cancelledAt: subscription.cancelledAt,
        activeWithStripe:
          stripeSubscriptionsById.has(subscription.id) &&
          ['active', 'past_due', 'unpaid'].includes(
            stripeSubscriptionsById.get(subscription.id)!.status,
          ),
      })),
    };
  },
);
