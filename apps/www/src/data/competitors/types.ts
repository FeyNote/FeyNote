export type RowValue = string | true | false | 'partial';

export interface ComparisonRow {
  feature: string;
  feynote: RowValue;
  competitor: RowValue;
  note?: string;
}

export interface ListItem {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MigrationStep {
  /** May contain inline HTML links; rendered with set:html. */
  body: string;
}

export interface CompetitorData {
  slug: string;
  name: string;
  url: string;
  tagline: string;
  subtitle: string;
  seoDescription?: string;
  cardSummary: string;
  intro: string[];
  pricingSummary: {
    feynote: string;
    competitor: string;
  };
  table: ComparisonRow[];
  whySwitch: ListItem[];
  competitorWins: ListItem[];
  migration: {
    headline: string;
    summary: string;
    steps: MigrationStep[];
    docsUrl?: string;
    docsLabel?: string;
    importUrl?: string;
    note?: string;
  };
  faqs: FaqItem[];
  closing: string[];
}
