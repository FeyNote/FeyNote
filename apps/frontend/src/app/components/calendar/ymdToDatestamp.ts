export const ymdToDatestamp = (ymd: {
  year: number;
  month: number;
  day: number;
}) => {
  return `${ymd.year}.${ymd.month}.${ymd.day}`;
};
