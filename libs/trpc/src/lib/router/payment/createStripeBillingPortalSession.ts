import { prisma } from '@feynote/prisma/client';

import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { stripe } from '@feynote/api-services';

export const createStripeBillingPortalSession = authenticatedProcedure.mutation(
  async ({
    ctx,
  }): Promise<{
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

    const billingPortalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
    });

    return {
      url: billingPortalSession.url,
    };
  },
);
