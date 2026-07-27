import type { CompetitorData } from './types';

export const notion: CompetitorData = {
  slug: 'notion',
  name: 'Notion',
  url: 'https://www.notion.com/',
  tagline: 'The free, open source Notion alternative for world-builders',
  subtitle:
    'FeyNote is a free, open source note-taking app built for tabletop RPG players and world-builders. Statblocks, fantasy calendars, deep references, and real-time collaboration, with no ads and no content limits.',
  seoDescription:
    'A free, open source Notion alternative built for D&D and TTRPG campaign notes. Statblocks, fantasy calendars, offline editing, and real-time collaboration. Always free.',
  cardSummary:
    'Free tier caps documents, collaborators, and embeds. Paid plans from $12/month. No TTRPG features.',
  intro: [
    'Notion is a popular note taking application that offers a large variety of features in a tiered account system. While Notion does have the concept of a Free tier, it unfortunately severely gatekeeps or limits its feature set to users of that tier, with the majority of functionality locked behind its paid subscription at $12/month.',
    'Feynote is a free-to-use note taking application offering free functionality that many competitors lock behind a paywall. Our platform supports an extra subset of tabletop features to enhance content creation. We are fully opensource and community funded.',
  ],
  pricingSummary: {
    feynote:
      'Free forever. No ads, no content limits, and no paywalled features. Optional pay-what-you-want contributions support hosting and artists.',
    competitor:
      'Free tier with limits on documents, collaborators, embeds, and offline sync. Paid plans start at $12 per month.',
  },
  table: [
    {
      feature: 'Price',
      feynote: 'Free',
      competitor: 'Limited Free Tier or starting at $12/month',
    },
    {
      feature: 'Multi-User Collaboration',
      feynote: true,
      competitor: 'Yes, but number of documents are limited on Free Tier',
    },
    {
      feature: 'Desktop App',
      feynote: 'Mac, Windows and Linux',
      competitor: 'Mac and Windows',
    },
    {
      feature: 'Offline',
      feynote: true,
      competitor: 'Yes, but cannot sync full collection on Free Tier',
    },
    {
      feature: 'References',
      feynote: true,
      competitor: true,
    },
    {
      feature: 'Map/Image Markup Tool',
      feynote: true,
      competitor: false,
      note: 'Feynote has a dedicated set of tooling for fantasy world building and maps, Notion is general purpose.',
    },
    {
      feature: 'File Upload',
      feynote: true,
      competitor: true,
    },
    {
      feature: 'Graph Based Notetaking',
      feynote: true,
      competitor: false,
      note: "Feynote allows you to choose whether you'd like to structure your notes by relationships or by hierarchy.",
    },
    {
      feature: 'Workspace Collaborators',
      feynote: true,
      competitor:
        'Yes, but limited to 10 Collaborators in Free Tier (Document count limits also apply in Free Tier)',
    },
    {
      feature: 'Embedded Content',
      feynote: true,
      competitor: 'Yes, but the number and type are limited in Free Tier',
    },
    {
      feature: 'Fantasy Theming',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Workspaces',
      feynote: true,
      competitor: 'Yes, but no private workspaces on Free Tier',
    },
    {
      feature: 'Workspace Permissioning',
      feynote: 'Fully supported to a granular level',
      competitor: 'Yes, but not on Free Tier',
    },
    {
      feature: 'Chat Agent',
      feynote: 'Yes, and can be disabled based on user preference',
      competitor: 'Yes, but with limitations in Free Tier',
    },
    {
      feature: 'Autoformatting of Statblocks, Items, Inserts',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Collection Export',
      feynote: 'Yes, supports Markdown documents & Json with references intact',
      competitor: 'Yes, but mangles your content',
    },
    {
      feature: 'Inbuilt Dice Roller',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Content Import by Url',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Fantasy Content Generator',
      feynote: 'Yes, but can be disabled based on user preference',
      competitor: false,
    },
  ],
  whySwitch: [
    {
      title: 'Purpose-built for TTRPGs',
      body: "Statblocks, spells, and items embed directly in your notes and can be themed to look like your source books. In Notion you're assembling all of this by hand from generic blocks.",
    },
    {
      title: 'Calendars for your world, not ours',
      body: "FeyNote lets you define an entirely arbitrary date system and organize notes by in-world dates. Notion's calendar only speaks the Gregorian calendar.",
    },
    {
      title: 'Works offline at the table',
      body: "FeyNote is offline-first, so your notes are fully editable without a connection — in a basement game store or at a table with no Wi-Fi. Notion's offline support is limited.",
    },
    {
      title: 'Free with no member seats',
      body: "Sharing a campaign with your whole party costs nothing in FeyNote. Notion's collaborative features push you toward per-member paid plans.",
    },
    {
      title: 'Open source',
      body: "FeyNote's code is on GitHub. You can see how it works, contribute, and export your content to JSON or Markdown whenever you want.",
    },
  ],
  competitorWins: [
    {
      title: 'General-purpose workspace',
      body: "Notion spans databases, project management, docs, and team wikis. FeyNote focuses on world-building and campaign notes, and doesn't try to run your business.",
    },
    {
      title: 'Mature native apps',
      body: "Notion ships polished desktop and mobile apps today. FeyNote's native desktop and mobile apps are still in the works — it currently runs as an offline-capable web app.",
    },
  ],
  migration: {
    headline: 'Bringing your Notion notes over',
    summary:
      'Export your Notion workspace as Markdown and bring it into FeyNote with the content importer.',
    steps: [
      {
        body: 'In Notion, open Settings, then Export content, and export your workspace as Markdown & CSV.',
      },
      {
        body: 'Create a free FeyNote account at app.feynote.com.',
      },
      {
        body: 'In FeyNote, open the content importer and upload your exported Markdown files.',
      },
      {
        body: 'Review your imported notes — internal links and images come across, and you can organize them into your tree from there.',
      },
    ],
    docsUrl: 'https://docs.feynote.com',
    docsLabel: 'Read the import documentation',
  },
  faqs: [
    {
      q: "Is FeyNote actually free? What's the catch?",
      a: 'Genuinely free. No ads, no limits on the amount of content, and every application feature is available to everyone. We accept pay-what-you-want contributions that raise limits only on things that are costly to host, like extra-large file uploads.',
    },
    {
      q: 'Can I keep using Notion while I try FeyNote?',
      a: "Yes. Importing into FeyNote doesn't touch your Notion workspace. Run them side by side for a campaign arc and see which one fits your table.",
    },
    {
      q: 'Do I need FeyNote to be a Notion replacement for everything?',
      a: 'No. Plenty of people keep Notion for work and use FeyNote for their campaigns and world-building, where its statblocks, references, and calendars actually fit the job.',
    },
    {
      q: 'Is there a free, open source alternative to Notion for D&D notes?',
      a: 'Yes. FeyNote is free and open source, built specifically for tabletop RPG notes: embedded statblocks, deep references between documents, graph view, custom fantasy calendars, offline editing, and real-time collaboration with your party.',
    },
  ],
  closing: [
    "Try FeyNote alongside Notion for a session or two. It's free, so if it fits your table, switch over. If it doesn't, your Notion workspace is still right where you left it.",
  ],
};
