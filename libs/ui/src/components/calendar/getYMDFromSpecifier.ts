import { dateSpecifier, daySpecifier } from './calendarDateSpecifierRegex';

export const getYMDFromSpecifier = (specifier: string) => {
  const daySpecifierMatch = specifier.match(daySpecifier)?.at(1);
  if (daySpecifierMatch) {
    return {
      year: 1,
      month: 1,
      day: parseInt(daySpecifierMatch),
    };
  }

  const dateSpecifierMatch = specifier.match(dateSpecifier);
  if (dateSpecifierMatch) {
    const [year, month, day] = dateSpecifierMatch
      .slice(1, 4)
      .map((x) => parseInt(x));

    if (!year || !month || !day) return;

    return {
      year,
      month,
      day,
    };
  }
};
