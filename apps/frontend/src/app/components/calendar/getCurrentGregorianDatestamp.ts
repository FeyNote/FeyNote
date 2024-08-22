import { ymdToDatestamp } from './ymdToDatestamp';

export const getCurrentGregorianDatestamp = () => {
  return ymdToDatestamp({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  });
};
