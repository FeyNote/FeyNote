import { notion } from './notion';
import { obsidian } from './obsidian';
import type { CompetitorData } from './types';

export const competitors: Record<string, CompetitorData> = {
  [notion.slug]: notion,
  [obsidian.slug]: obsidian,
};

export const competitorSlugs = Object.keys(competitors);

export const competitorList: CompetitorData[] = Object.values(competitors);
