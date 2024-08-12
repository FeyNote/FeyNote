import type { ArtifactDTO } from '@feynote/prisma/types';
import {
  dashDelimitedDateSpecifier,
  periodDelimitedDateSpecifier,
  slashDelimitedDateSpecifier,
} from './calendarDateSpecifierRegex';

export const getYMDFromReference = (
  reference: ArtifactDTO['incomingArtifactReferences'][0],
) => {
  const date = reference.targetArtifactDate;
  if (!date) return;

  if (
    date.match(dashDelimitedDateSpecifier) ||
    date.match(periodDelimitedDateSpecifier) ||
    date.match(slashDelimitedDateSpecifier)
  ) {
    const [year, month, day] = date.split(/[-/.]/);
    const result = {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
    };
    if (!result.year || !result.month || !result.day) return;
    return result;
  }
};
