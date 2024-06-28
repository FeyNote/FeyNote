export const coerceBoolean = (value: string): boolean => {
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  throw new Error(`Tried to parse ${value} as boolean`);
};
