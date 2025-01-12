import { prisma } from '@feynote/prisma/client';
import { CAPABILITY_GRACE_PERIOD_DAYS } from '@feynote/shared-utils';

export const getSubscriptionsForUser = async (
  userId: string,
  includeExpired?: boolean,
) => {
  // Allow users to continue to access expired features for a grace period
  const capabilityGracePeriod = new Date();
  capabilityGracePeriod.setDate(
    capabilityGracePeriod.getDate() - CAPABILITY_GRACE_PERIOD_DAYS,
  );
  const mustBeValidUntil = includeExpired
    ? new Date('1980')
    : capabilityGracePeriod;

  const subscriptions = prisma.subscription.findMany({
    where: {
      userId,
      OR: [
        {
          expiresAt: {
            gte: mustBeValidUntil,
          },
        },
        {
          expiresAt: null,
        },
      ],
    },
  });

  return subscriptions;
};
