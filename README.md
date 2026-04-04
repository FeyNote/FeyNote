# FeyNote

<div align="center">

**A powerful note-taking app for world-builders and tabletop RPG players**

[![License](https://img.shields.io/badge/License-Dual-blue.svg)](#LICENSE)

[Website & App](https://feynote.com) • [Documentation](https://docs.feynote.com) • [Discord](https://discord.gg/Tz8trXrd4C) • [Report Bug](https://github.com/feynote/feynote/issues)

</div>

## What is FeyNote?

FeyNote is a free, open-source note-taking application written by humans, specifically designed for tabletop RPG enthusiasts and world-builders. Whether you're a dungeon master crafting intricate campaigns or a player keeping track of your character's journey, FeyNote provides powerful tools to organize, share, and bring your TTRPG worlds to life.

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

#### **Import Formats**

- **Obsidian**
- **Logseq**
- **DocX**
- **Google Drive/Docs** (via export to docx)
- **URLs** (automatically parses and formats TTRPG content)

#### **Supported Export Formats**

- **JSON** (for text documents this is in Tiptap JSON format)
- **Markdown**

## Tech Stack

- **Frontend**: React 19, Radix UI
- **Text Editor**: TipTap with a ton of custom extensions
- **Map & Drawing**: TLDraw
- **Calendar**: Completely custom
- **Real-time Collaboration**: Yjs, Hocuspocus, custom sync engine via a service worker
- **Backend**: Node.js, Express + tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Search**: Typesense (for online) + MiniSearch (for offline) via service worker
- **Content Import, Scraping, any (light) AI**: AI SDK
- **Website & Docs**: Astro + Astro Starlight
- **Offline**: Again, custom sync engine via a service worker which leans heavily on IndexedDB

## Getting Started

### Using FeyNote

There's a web version available at [feynote.com](https://feynote.com).

There's a desktop version available at [feynote.com/download](https://feynote.com/download).

Both versions fully support offline mode. The desktop version adds a few features, such as better keyboard shortcuts and some better (more reliable) offline persistence.

### For Developers

#### Prerequisites

- Node, I recommend using NVM (see .nvmrc for the current Node version we use)
- Docker and Docker Compose

#### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/feynote/feynote.git
   cd feynote
   ```

2. **Install dependencies**

   ```bash
   nvm use
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .example.env .env
   # Edit .env with your configuration -- some AWS credentials are going to be necessary for file upload and such
   ```

4. **Start**

   ```bash
   ./dev.sh up
   ```

5. **Access the application**
   - Application: http://localhost:80
   - Website: http://localhost:8080
   - Docs: http://localhost:8081

You can see all commands for local dev via `./dev.sh`.

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
│   ├── frontend/         # App - powers app.feynote.com
│   ├── hocuspocus/       # Hocuspocus realtime Y.js collaboration server - powers hocuspocus.feynote.com
│   ├── websocket/        # Socket.IO websocket server - powers websocket.feynote.com
│   ├── queue-worker/     # BullMQ background job processing
│   ├── www/              # Astro marketing website & sharing SSR+SSG for share cards
│   ├── docs/             # Astro starlight SSG documentation site (no SSR)
│   └── cli/              # Command-line tools (migration tools, etc)
├── libs/                 # Shared libraries - most code should go in here rather than the apps themselves
└── prisma/               # Database schema and migrations
```

## Contributing

Code contributions are always very welcome. We're very open to collaborating, and if there's a feature you'd like to see come to FeyNote we'd love to help you facilitate that.

Please open an issue, @mention us, or comment prior to starting work on any larger contribution (a direct PR is fine if you have a small patch). We may have suggestions for how to approach the problem, where one might look to implement a feature, or general guidance of how to "fit" the FeyNote UX.

### Contributions with AI Content

We must note that we do not accept any AI-assisted code or PRs. We won't dive deep into explaining why here, but here are a few of our main reasons:

1. It takes us quite a lot of time since AI-generated PRs almost always require significant changes
2. AI-generated PRs effectively cause us to act through you as a "proxy" for prompting, as you feed my comments back through your AI prompt
3. If we haven't tackled something yet, it's probably because it's not trivial and/or requires some thought and design, both of which AI is not great at

Again, as I said above I'm very open to collaborating -- just no AI-generated code please :)

### CLA

All contributors must sign our [Contributor License Agreement](CLA.md).

This allows FeyNote to continue to provide the hosted instance, as well as license the API to other projects that may not have compatible licenses with AGPL.

When contributing or suggesting code for FeyNote, you irrevocably grant FeyNote all rights to that code. See the CLA file in the repo for the complete CLA.

### Rules for Contributing

1. No AI generated code. You _must_ vet the code you write, and AI generated submissions will be closed (respectfully)
2. Do not submit copyrighted material
3. Do not commit large assets to the repository. Send them to us so that we can upload them to our CDN and avoid repository size bloat
4. Be prepared to be receptive to (gentle and positive!) feedback, since we work hard to make a highly polished end product

## License

FeyNote uses a **dual-license model** for it's open source code.

This license section is not a complete overview of the licensing terms. See [LICENSE.md](LICENSE.md) for full details. Here's a summary, though:

**Personal Non-Commercial Use**

For personal, private, non-commercial use, FeyNote is licensed under **AGPL-3.0 with restrictions**. You can use and modify FeyNote for personal use, but commercial use or distribution to others requires a commercial license.

**Commercial & Non-Personal Use**

Any commercial use, business use, or distribution to others requires a separate commercial license. Contact us at **julian@poyourow.com** for licensing information.

Pricing for commercial licenses depends on usage, and all proceeds support the project and community.

## Community, and Support

We recommend joining our **Discord**: [https://discord.gg/Tz8trXrd4C](https://discord.gg/Tz8trXrd4C) as we'll have the quickest response time and other community members can help.

The documentation is also very helpful [docs.feynote.com](https://docs.feynote.com), but is quite early-stage since we're still working on a lot within the project.

Github issues are a good place if you have a direct bug or code issue, but I do recommend Discord as a starting place instead.

If none of the above fit, or if you have a security-sensitive or private issue, you can email me at julian@poyourow.com.
