import { prisma } from '@feynote/prisma/client';
import { generateAuthResetToken } from '../session/generateAuthResetToken';
import { ResetEmailMail } from '../mailer/mail/ResetEmailMail';
import { AuthResetTokenType } from '@prisma/client';

export const triggerResetEmail = async (email: string, returnUrl: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    return false;
  }

  const authResetToken = await generateAuthResetToken(
    user.id,
    AuthResetTokenType.email,
  );

  const resetLink = new URL(returnUrl);
  resetLink.searchParams.set('resetEmailToken', authResetToken.token);

  const mail = new ResetEmailMail({
    to: [email],
    name: user.username || email.toLowerCase(),
    resetLink: resetLink.toString(),
  });

  await mail.send();

  return true;
};
