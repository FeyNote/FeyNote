import { notion } from './notion';
import type { CompetitorData } from './types';

export const competitors: Record<string, CompetitorData> = {
  [notion.slug]: notion,
};

export const competitorSlugs = Object.keys(competitors);

export const competitorList: CompetitorData[] = Object.values(competitors);
