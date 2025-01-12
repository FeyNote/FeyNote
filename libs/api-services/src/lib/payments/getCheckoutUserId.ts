import { prisma } from '@feynote/prisma/client';

export const getCheckoutUserId = async (args: {
  customerId: string;
  customerEmail?: string;
}) => {
  const userByCustomerId = await prisma.user.findFirst({
    where: {
      stripeCustomerId: args.customerId,
    },
    select: {
      id: true,
    },
  });

  if (userByCustomerId) {
    return userByCustomerId.id;
  }

  if (args.customerEmail) {
    const userByEmail = await prisma.user.findFirst({
      where: {
        email: args.customerEmail,
      },
    });

    if (userByEmail) {
      return userByEmail.id;
    }
  }

  return undefined;
};
