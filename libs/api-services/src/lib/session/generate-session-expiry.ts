export const generateSessionExpiry = (daysValid: number) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);
  return expiresAt;
};
