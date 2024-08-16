import type { ArtifactDTO } from '@feynote/prisma/types';
import {
  dashDelimitedDateSpecifier,
  periodDelimitedDateSpecifier,
  poundDaySpecifier,
  slashDelimitedDateSpecifier,
} from './calendarDateSpecifierRegex';

export const getYMDFromSpecifier = (specifier: string) => {
  if (specifier.match(poundDaySpecifier)) {
    const [_, day] = specifier.split(/#/);

    return {
      year: 1,
      month: 1,
      day: parseInt(day),
    };
  }

  if (
    specifier.match(dashDelimitedDateSpecifier) ||
    specifier.match(periodDelimitedDateSpecifier) ||
    specifier.match(slashDelimitedDateSpecifier)
  ) {
    const [year, month, day] = specifier.split(/[-/.]/);
    const result = {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
    };
    if (!result.year || !result.month || !result.day) return;
    return result;
  }
};
