import { prisma } from '@feynote/prisma/client';
import { PasswordResetMail } from '../mailer/mail/PasswordResetMail';
import { generatePasswordResetSession } from '../session/generatePasswordResetSession';

export const triggerPasswordReset = async (
  email: string,
  returnUrl: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return false;
  }

  const session = await generatePasswordResetSession(user.id);

  const resetLink = new URL(returnUrl);
  resetLink.searchParams.set('passwordResetToken', session.token);

  const mail = new PasswordResetMail(
    [email],
    user.username || email,
    resetLink.toString(),
  );

  await mail.send();

  return true;
};
