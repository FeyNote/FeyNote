export const generateAuthResetTokenExpiry = (hoursValid: number) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hoursValid);
  return expiresAt;
};
