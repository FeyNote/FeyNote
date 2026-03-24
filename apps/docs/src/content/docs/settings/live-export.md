---
title: Live Export
description: Continuously export your documents to a local folder as Markdown and JSON files.
---

Live Export keeps a folder on your computer in sync with your FeyNote documents. As you write and edit, your files are automatically updated in the background. Text documents are saved as Markdown (`.md`) files and drawings are saved as JSON (`.json`) files.

This is useful for local backups, integrating with other tools that read Markdown files, or simply having offline access to your content outside the app.

**Live Export is only available in the desktop app**, since it requires access to your computer's file system.

## Setting Up

1. Open [Settings](/docs/settings/general) in the left side menu.
2. Find the **Live Export to Local Folder** section.
3. Click **Select Folder** and choose (or create) the folder where you'd like your documents to go.
4. FeyNote will ask you to confirm, then export all your existing documents to the folder.

Once enabled, the setting shows the current export path and a **Disable** button if you ever want to turn it off.

## How It Works

Once Live Export is active, three things keep your files up to date:

- **When you edit a document** that's open in the app, changes are written to the file after a short delay.
- **When a document changes on another device** (or another tab), the background sync picks up the change and updates the corresponding file.
- **When you first enable Live Export**, all your existing documents are exported at once so everything starts in sync.

Calendar documents are not exported.

## File Naming

Each file is named using the document's title and a short identifier to avoid name collisions:

```
My Document (a1b2c3d4).md
```

If you rename a document in FeyNote, the file on disk is renamed to match.

## Deleted Documents

When you delete a document in FeyNote, the exported file is not removed. Instead, it is renamed with a `DELETED - ` prefix:

```
DELETED - My Document (a1b2c3d4).md
```

This gives you a safety net so you can recover the content if needed.

## Manifest File

Inside the export folder you'll find a `.feynote-export.json` file. This is a small manifest that FeyNote uses to track which files belong to which documents. You can safely ignore it, but don't delete it while Live Export is active or FeyNote won't be able to detect renames and deletions properly.

## Disabling Live Export

To stop exporting, go to Settings and click **Disable** under the Live Export section. This stops all future file updates but leaves the already-exported files in place. You can re-enable it at any time and FeyNote will pick up where it left off.
