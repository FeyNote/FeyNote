import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';
import {
  SUBSCRIPTION_MODELS,
  SubscriptionModelName,
} from '@feynote/shared-utils';

export const extendSubscription = async (args: {
  userId: string;
  priceName: string;
  tx?: Prisma.TransactionClient;
}) => {
  const tx = args.tx || prisma;

  if (!(args.priceName in SUBSCRIPTION_MODELS)) {
    throw new Error('Invalid subscription name');
  }

  const subscriptionModel = args.priceName as SubscriptionModelName;
  const renewalLengthDays =
    SUBSCRIPTION_MODELS[subscriptionModel].expiresInDays;

  const existingSubscription = await tx.subscription.findUnique({
    where: {
      userId_name: {
        userId: args.userId,
        name: args.priceName,
      },
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  const expiresAt = existingSubscription?.expiresAt
    ? existingSubscription.expiresAt
    : new Date();
  expiresAt.setDate(expiresAt.getDate() + renewalLengthDays);

  await tx.subscription.upsert({
    where: {
      userId_name: {
        userId: args.userId,
        name: args.priceName,
      },
    },
    update: {
      expiresAt,
    },
    create: {
      userId: args.userId,
      name: args.priceName,
      expiresAt,
    },
  });
};
