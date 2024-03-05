import { prisma } from '@dnd-assistant/prisma/client';
import { PasswordResetMail } from '../mailer/mail/PasswordResetMail';
import { generatePasswordResetSession } from '../session/generatePasswordResetSession';

export const triggerPasswordReset = async (
  email: string,
  returnUrl: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    // We do nothing when a user account is not found so as not to reveal if an account exists with the given email
    return;
  }

  const session = await generatePasswordResetSession(user.id);

  const resetLink = new URL(returnUrl);
  resetLink.searchParams.set('token', session.token);

  const mail = new PasswordResetMail(
    [email],
    user.username || email,
    resetLink.toString()
  );

  await mail.send();
};
