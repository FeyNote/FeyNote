import { getYMDFromSpecifier } from './getYMDFromSpecifier';
import { ymdToDatestamp } from './ymdToDatestamp';

export const specifierToDatestamp = (specifier: string) => {
  const ymd = getYMDFromSpecifier(specifier);
  if (!ymd) return;

  const datestamp = ymdToDatestamp(ymd);
  return datestamp;
};
