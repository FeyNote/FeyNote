# FeyNote

<div align="center">

**A powerful note-taking app for world-builders and tabletop RPG players**

[![License](https://img.shields.io/badge/License-Dual-blue.svg)](#LICENSE)

[Website & App](https://feynote.com) • [Documentation](https://docs.feynote.com) • [Discord](https://discord.gg/Tz8trXrd4C) • [Report Bug](https://github.com/feynote/feynote/issues)

</div>

## What is FeyNote?

FeyNote is a free, open-source note-taking application specifically designed for tabletop RPG enthusiasts and world-builders. Whether you're a dungeon master crafting intricate campaigns or a player keeping track of your character's journey, FeyNote provides powerful tools to organize, share, and bring your TTRPG worlds to life.

### Why FeyNote? Key Features:

- **TTRPG-First Design**: Embed statblocks, spells, and items directly within your notes. Create custom content or tweak official content as you edit. FeyNote makes formatting and creating custom monster blocks, items, and other TTRPG content effortless.
- **Link/Reference Content**: Create references between documents that automatically update as you edit
- **Offline**: Full functionality offline with automatic sync when you reconnect
- **Real-Time Collaboration**: Edit simultaneously with your party or co-DMs with live cursors
- **Custom Calendars**: Build entirely custom date systems for your fantasy worlds
- **Flexible Organization**: Use both tree hierarchies and graph views to organize content depending on your preference
- **Automatic Import**: Use both tree hierarchies and graph views to organize content depending on your preference
- **Block-Style Nesting**: Organize notes in bullet-journal style with hierarchical blocks

### Screenshots

<div align="center">

![FeyNote Artifact Editor](https://static.feynote.com/screenshots/feynote-artifact-20240924.jpg)
_Rich TTRPG content editing with embedded statblocks_

![FeyNote Artifact Editor](https://static.feynote.com/screenshots/feynote-references-20240924.jpg)
_Linking & Referencing content makes it easy to relate NPCs and storylines without repetition_

![FeyNote Graph View](https://static.feynote.com/screenshots/feynote-graph-20240924.jpg)
_Visualize connections between your world's content_

![FeyNote Calendar](https://static.feynote.com/screenshots/feynote-calendar-20240924.jpg)
_Fully customizable fantasy calendar system_

</div>

### Import & Export

#### **Supported Import Formats**

- **Obsidian**: Import your Obsidian vaults
- **Logseq**: Bring in your Logseq content
- **URLs**: Paste a URL and automatically pull formatted TTRPG content

#### **Supported Export Formats**

- **JSON**: Export documents in structured JSON format
- **Markdown**: Standard markdown export for portability

## Tech Stack

FeyNote is built with modern web technologies:

- **Frontend**: React 19, Radix UI
- **Text Editor**: TipTap (ProseMirror-based)
- **Map+Drawing Editor**: TLDraw
- **Calendar**: Completely custom
- **Real-time Collaboration**: Yjs, Hocuspocus, custom sync engine
- **Backend**: Node.js, Express + tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Search**: Typesense (for online) + MiniSearch (for offline)
- **Content Import, Scraping, any (light) AI**: AI SDK
- **Website**: Astro

## Getting Started

### For Users

Visit [feynote.com](https://feynote.com) to start using FeyNote immediately. No installation required!

### For Developers

#### Prerequisites

- Node.js 18+ (see `.nvmrc` for exact version)
- Docker and Docker Compose

#### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/feynote/feynote.git
   cd feynote
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .example.env .env
   # Edit .env with your configuration
   ```

4. **Start**

   ```bash
   ./dev.sh start
   ```

5. **Access the application**
   - Application: http://localhost:80
   - Website: http://localhost:8080
   - Docs: http://localhost:8081

You can see all commands for local dev via `make

#### Working with Stripe (Payment Testing)

1. Setup a Stripe project in test mode
2. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli/install)
3. Forward Stripe events to your local webhook:
   ```bash
   stripe listen --forward-to localhost:80/api/stripe/webhook
   ```
4. Set the webhook signing secret in your `.env` file as `STRIPE_WEBHOOK_SECRET`
5. Set the API key in your `.env` file as `STRIPE_API_KEY`

## Project Structure

```
feynote/
├── apps/
│   ├── backend/          # Express server (a small number of express routes & tRPC instantiation)
│   ├── frontend/         # App (React)
│   ├── hocuspocus/       # Real-time collaboration server (Hocuspocus)
│   ├── websocket/        # WebSocket server (Socket.IO)
│   ├── queue-worker/     # Background job processing (BullMQ)
│   ├── www/              # Marketing website & sharing SSG (Astro)
│   ├── docs/             # Documentation site (Astro Starlight)
│   └── cli/              # Command-line tools (migration tools, etc)
├── libs/                 # Shared libraries
├── prisma/               # Database schema and migrations
└── scripts/              # Utility scripts
```

## Contributing

We welcome contributions from the community! FeyNote is built by TTRPG enthusiasts, for TTRPG enthusiasts.

### Before Contributing

1. **Check existing issues**: See if someone is already working on it
2. **File an issue**: Record that you're going to work on it and reach out to us
3. **Sign the CLA**: All contributors must sign our [Contributor License Agreement](CLA.md)

### Rules for Contributing

1. No low-quality AI generated code. You _must_ vet the code you write, and low-quality AI generated submissions will be closed (respectfully)
2. Do not submit copyrighted material
3. Do not commit large assets to the repository. Send them to us so that we can upload them to our CDN and avoid repository size bloat
4. Be prepared to be receptive to (gentle and positive!) feedback, since we work hard to make a highly polished end product

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style (Prettier/ESLint configs included)
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

## License

FeyNote uses a **dual-license model**:

### Personal Non-Commercial Use

For personal, non-commercial use, FeyNote is licensed under **AGPL-3.0 with restrictions**. You can use and modify FeyNote for personal use, but commercial use or distribution to others requires a commercial license.

### Commercial & Non-Personal Use

Any commercial use, business use, or distribution to others requires a separate commercial license. Contact us at **julian@poyourow.com** for licensing information.

Pricing for commercial licenses depends on usage, and all proceeds support the project and community.

This license section is not a complete overview of the licensing terms. See [LICENSE.md](LICENSE.md) for full details.

### Contributor License Agreement

All contributors must sign our [CLA](CLA.md), which assigns copyright to the project maintainers (Julian Poyourow and Chris Meyer) to enable dual licensing.

## Selfhost

To selfhost FeyNote in your personal homelab, there's a dedicated [README here](./selfhosting-toolkit/README.md)

## Roadmap

We're actively working on:

- **Unlinked References**: Automatic detection of content missing references (e.g., NPC names)
- **Google Docs Import**: Import downloads from Google Docs
- **Enhanced Theming**: New themes and improved customization
- **Native Apps**: Desktop and mobile applications
- **Additional Export Formats**: More ways to export your content

## Community & Support

- **Website**: [feynote.com](https://feynote.com)
- **Documentation**: [docs.feynote.com](https://docs.feynote.com)
- **Issues**: [GitHub Issues](https://github.com/feynote/feynote/issues)
- **Email**: julian@poyourow.com
- **Commercial Licensing**: julian@poyourow.com

## Team

**Julian Poyourow** - Co-creator, Software Engineer @ Mozilla, creator of [RecipeSage](https://recipesage.com)
**Chris Meyer** - Co-creator, Software Engineer @ 2U

We're both passionate TTRPG players and software engineers who built FeyNote to enhance the tabletop gaming experience for ourselves and the community.

<div align="center">

**Built with <3 for the TTRPG community**

</div>
