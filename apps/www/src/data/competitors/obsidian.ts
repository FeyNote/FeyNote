import type { CompetitorData } from './types';

export const obsidian: CompetitorData = {
  slug: 'obsidian',
  name: 'Obsidian',
  url: 'https://obsidian.md/',
  tagline:
    'The free, open source Obsidian alternative for world-builders and D&D',
  metaTitle:
    'The free, open source Obsidian alternative for world-builders and D&D',
  subtitle:
    'FeyNote is a free, community-driven and open-source note-taking application designed for speed, scale and collaboration. We allow for granular-based permissioning that allows you to choose how and what you want to share alongside a flexible organization system that keeps your notes in a style that best fits you!',
  seoDescription:
    'A free, open source Obsidian alternative built for D&D and TTRPG campaign notes. Statblocks, fantasy calendars, offline editing, and real-time collaboration. Always free.',
  cardSummary:
    'Free app, but syncing, publishing, and collaboration are paid add-ons from $4/month. No TTRPG features.',
  intro: [
    'Obsidian is a popular graph-based note-taking application. The application itself is free to download and use, with the only paid features being: syncing your notes between devices, publishing notes to the web, and sharing/collaboration. Obsidian offers three tiers: a free tier, a syncing tier for $4/month, and a publishing tier for $8/month, with both paid tiers allowing for collaboration at a vault level.',
    'FeyNote is a free-to-use note-taking application offering free functionality that many competitors lock behind a paywall. Our platform supports an extra subset of tabletop features to enhance content creation for D&D, Pathfinder, and other TTRPG campaigns. We are fully open source and community-funded.',
  ],
  pricingSummary: {
    feynote:
      'Free forever. No ads, no content limits, and no paywalled features. Optional pay-what-you-want contributions support hosting and artists.',
    competitor:
      'Free to download and use. Syncing between devices costs $4/month and publishing to the web costs $8/month, with collaboration limited to the paid tiers.',
  },
  table: [
    {
      feature: 'Price',
      feynote: 'Free',
      competitor: 'Free, $4 or $8/month depending on tier',
    },
    {
      feature: 'Multi-User Collaboration',
      feynote: true,
      competitor: '$4/month',
    },
    {
      feature: 'Desktop App',
      feynote: 'Mac, Windows and Linux',
      competitor: 'Mac, Windows and Linux',
    },
    {
      feature: 'Offline',
      feynote: true,
      competitor: true,
    },
    {
      feature: 'Syncing',
      feynote: true,
      competitor: '$4/month',
    },
    {
      feature: 'Collection Export',
      feynote: 'Yes, supports Markdown documents & JSON with references intact',
      competitor: false,
    },
    {
      feature: 'References',
      feynote: true,
      competitor: 'Yes, but limited by vault',
    },
    {
      feature: 'Content Import by URL',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Plugin Support',
      feynote: false,
      competitor: true,
      note: 'FeyNote is fully open source and any community member is able to add functionality to its capabilities through GitHub.',
    },
    {
      feature: 'Map/Image Markup Tool',
      feynote: true,
      competitor: true,
    },
    {
      feature: 'Autoformatting of Statblocks, Items, Inserts',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Workspace Permissioning',
      feynote: 'Fully supported to a granular level',
      competitor: '$4/month',
    },
    {
      feature: 'File Upload',
      feynote: true,
      competitor: true,
    },
    {
      feature: 'Graph Based Notetaking',
      feynote: true,
      competitor: true,
      note: "FeyNote allows you to choose whether you'd like to structure your notes by relationships or by hierarchy.",
    },
    {
      feature: 'Inbuilt Dice Roller',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Workspace Collaborators',
      feynote: true,
      competitor: '$4/month',
    },
    {
      feature: 'Embedded Content',
      feynote: true,
      competitor: true,
    },
    {
      feature: 'Fantasy Theming',
      feynote: true,
      competitor: false,
    },
    {
      feature: 'Workspaces',
      feynote: true,
      competitor: true,
    },
    {
      feature: 'Note Templating',
      feynote: 'partial',
      competitor: true,
      note: 'While FeyNote does not have a concept of dedicated templates, we make it easy to create and duplicate notes that serve as templates.',
    },
    {
      feature: 'Chat Agent',
      feynote: 'Yes, and can be disabled based on user preference',
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
      body: "Statblocks, spells, and items embed directly in your notes and can be themed to look like your source books. In Obsidian you're stitching this together from community plugins.",
    },
    {
      title: 'Free sync and real-time collaboration',
      body: 'Obsidian charges $4/month to sync between devices, and collaboration requires a paid tier. FeyNote syncs your notes and lets your whole party edit together for free.',
    },
    {
      title: 'Share with your party',
      body: 'Publishing notes to the web costs $8/month in Obsidian. FeyNote lets you share documents and workspaces with your players for free.',
    },
    {
      title: 'Open source',
      body: "Obsidian's code is closed source. FeyNote's code is on GitHub, so you can see how it works, contribute, and export your content to JSON or Markdown whenever you want.",
    },
  ],
  competitorWins: [
    {
      title: 'Plugin ecosystem',
      body: 'Obsidian has thousands of community plugins and themes that can reshape the app into almost anything. FeyNote does not support plugins today.',
    },
    {
      title: 'Note templating',
      body: 'Obsidian lets you define reusable note templates and stamp out new pages from them. FeyNote does not support note templating today, though statblocks, items, and inserts cover the common TTRPG shapes.',
    },
  ],
  migration: {
    headline: 'Bringing your Obsidian vault over',
    summary:
      'Zip your Obsidian vault and bring it into FeyNote with the content importer.',
    steps: [
      {
        body: 'In Obsidian, open the ellipsis menu in the top-right corner and select "Show in System Explorer".',
      },
      {
        body: 'Navigate up to where you can select your vault folder, right-click it, and compress it to a zip.',
      },
      {
        body: 'Create a free FeyNote account at app.feynote.com.',
      },
      {
        body: 'In FeyNote, navigate to Settings in the left-side bar, select "Import Document Data", and upload your zipped vault.',
      },
      {
        body: 'Review your imported notes. Internal links and images come across, and you can organize them into your tree from there.',
      },
    ],
    docsUrl: 'https://docs.feynote.com/settings/import/obsidian/',
    docsLabel: 'Read the Obsidian import guide',
  },
  faqs: [
    {
      question: "Is FeyNote actually free? What's the catch?",
      answer:
        'Genuinely free. No ads, no limits on the amount of content, and every application feature is available to everyone. We accept pay-what-you-want contributions that raise limits only on things that are costly to host, like extra-large file uploads.',
    },
    {
      question: 'Can I keep using Obsidian while I try FeyNote?',
      answer:
        "Yes. Importing into FeyNote reads a zipped copy of your vault and doesn't touch your local files. Run them side by side for a campaign arc and see which one fits your table.",
    },
    {
      question: 'Will my Obsidian links survive the import?',
      answer:
        "FeyNote's importer understands Obsidian-style references, so internal links between your Markdown files are preserved and converted into FeyNote references.",
    },
    {
      question:
        'Is there a free, open source alternative to Obsidian for D&D notes?',
      answer:
        'Yes. FeyNote is free and open source, built specifically for tabletop RPG notes: embedded statblocks, deep references between documents, graph view, custom fantasy calendars, offline editing, and real-time collaboration with your party.',
    },
  ],
  closing: [
    "Try FeyNote alongside Obsidian for a session or two. It's free, so if it fits your table, switch over. If it doesn't, your vault is still right where you left it.",
  ],
};
