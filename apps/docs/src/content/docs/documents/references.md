---
title: Document References
description: Connect your documents, blocks, and calendar dates together with references.
---

References are a way to connect your documents together.
Rather than keeping everything in one long document or duplicating content across many, you can create links between related pieces of your collection and navigate between them freely.

This is especially useful for worldbuilding. Say you've created a custom monster that appears in three different dungeons. Instead of copying the monster's stats into each dungeon document, you can write it once and reference it from each location. If you ever update the monster, every reference stays current automatically.

## Creating References

To create a reference, type `@` while editing a [text document](/docs/documents/text). A search menu will appear where you can find and select the content you want to reference. The menu filters as you type, searching both document titles and the text content of blocks within your documents.

You can reference:

- **Entire documents** including text, drawing, and calendar documents
- **Specific blocks** such as headings or paragraphs within a text document
- **Calendar dates** within a calendar document (a date picker will appear after you select the calendar, letting you choose the exact date)

Press `Enter` or click on a result to insert the reference.

### Creating New Documents from the Reference Menu

If your search doesn't match any existing content, you can create a brand new document right from the reference menu. The menu will show a "Create" option using your search text as the new document's title. This is a quick way to reference something you haven't written yet and come back to fill it in later.

## Interacting with References

Once a reference is in your document, you can interact with it in a few ways:

- **Hover** over a reference to see a preview of its content. Text documents show a snippet, drawings show the drawing, and calendar references show the calendar at the referenced date.
- **Click** a reference to navigate directly to the referenced document, block, or calendar date.
- References automatically appear as connections in the [document graph](/docs/documents/graph), giving you a visual map of how your content is linked together.
- A list of all [incoming](#incoming-references) and [outgoing](#creating-references) references for the current document is available in the right sidebar, so you can see at a glance what your document links to and what links back to it.

## Incoming References

When other documents reference a block in your document, a small counter badge appears in the corner of that block showing how many incoming references it has.

Hover over (or click) the badge to see a list titled "Incoming References to This Block". Each entry shows the source document and the text surrounding the reference. Click any entry to jump straight to the document that references your block.

You can also see a full list of all incoming and outgoing references for the current document in the right sidebar. Incoming references are grouped by their source document, and you can expand each group to see the individual references.

## Keeping References Up to Date

When you rename a document or update a referenced block, all references pointing to it are updated automatically. No action is needed to keep your references current.

## Sharing

When you reference a document that has different sharing settings than the one you're editing, FeyNote will let you know and offer options to bring them in sync. When creating a new document through the reference menu, you can also choose whether the new document should inherit the current document's sharing settings. See [Sharing Documents](/docs/documents/sharing) for full details on how sharing works with references.

An important note is that references don't inherently give access. If you create a reference from a shared document A to a shared document B, all participants on document A will see the reference to document B, but only those who have been granted access directly to document B will be able to click the reference and navigate to document B.

## Workspaces

By default, the reference search is scoped to your active [workspace](/docs/general/workspaces). To search across all workspaces when creating references, turn on **Search all workspaces for references** in [settings](/docs/settings/general#workspace-behavior).

References can be created cross-workspace, and workspaces do nothing to prevent referencing content other than your search preference.
