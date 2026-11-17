import type { Translator } from './i18n/translations';

export interface Faq {
  question: string;
  answer: string;
}

export function getLandingFaqs(t: Translator): Faq[] {
  return [
    {
      question: t('landing.faq.free.question'),
      answer: t('landing.faq.free.answer'),
    },
    {
      question: t('landing.faq.systems.question'),
      answer: t('landing.faq.systems.answer'),
    },
    {
      question: t('landing.faq.compare.question'),
      answer: t('landing.faq.compare.answer'),
    },
    {
      question: t('landing.faq.players.question'),
      answer: t('landing.faq.players.answer'),
    },
    {
      question: t('landing.faq.writers.question'),
      answer: t('landing.faq.writers.answer'),
    },
    {
      question: t('landing.faq.offline.question'),
      answer: t('landing.faq.offline.answer'),
    },
  ];
}
