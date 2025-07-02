import { prisma } from '@feynote/prisma/client';
import { ResetPasswordMail } from '../mailer/mail/ResetPasswordMail';
import { generateAuthResetToken } from '../session/generateAuthResetToken';
import { AuthResetTokenType } from '@prisma/client';

export const triggerResetPassword = async (
  email: string,
  returnUrl: string,
) => {
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
    AuthResetTokenType.password,
  );

  const resetLink = new URL(returnUrl);
  resetLink.searchParams.set('resetPasswordToken', authResetToken.token);

  const mail = new ResetPasswordMail({
    to: [email],
    name: user.username || email.toLowerCase(),
    resetLink: resetLink.toString(),
  });

  await mail.send();

  return true;
};
