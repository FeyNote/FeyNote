---
title: Text Documents
description: Create rich text documents with formatting, tables, media, dice rolling, and TTRPG statblocks.
---

The text editor is the main interface for creating and editing documents in FeyNote.
It's a rich text editor that supports many of the features you'd expect from a modern writing tool, along with some unique and powerful features built specifically for tabletop games.

You can format text, insert tables and media, reference other documents, and even roll dice directly from your notes.

## Headings and Paragraphs

Headings and paragraphs are the building blocks of any document.
Six levels of heading are supported, letting you create a clear structure for your content.

The quickest way to create a heading is to type `#` at the start of a new line followed by a space. Use more `#` symbols for smaller headings. For example, `###` creates a level 3 heading.

You can also use the toolbar menus or the keyboard shortcuts [`Mod+Alt+1` through `Mod+Alt+6`](/docs/general/keyboard-shortcuts) to set a heading level.

## Text Formatting

You can style your text using bold, italic, underline, and strikethrough. These are available through keyboard shortcuts, the toolbar menus, or the [bubble menu](#bubble-menu) that appears when you select text.

- **Bold** - [`Mod+B`](/docs/general/keyboard-shortcuts)
- **Italic** - [`Mod+I`](/docs/general/keyboard-shortcuts)
- **Underline** - [`Mod+U`](/docs/general/keyboard-shortcuts)
- **Strikethrough** - [`Mod+Shift+X`](/docs/general/keyboard-shortcuts)

## Font Families

FeyNote includes a selection of fonts to give your documents the right feel. You can change the font for any text using the [bubble menu](#bubble-menu) or the top menu bar. Available fonts include:

- Default
- Sans-Serif
- Serif
- Libre Baskerville
- Baskerville Fantasy
- Allison
- Italianno
- Monsieur La Doulaise

These are great for adding character to handouts, letters, or other in-game documents your players might read.

## Text Alignment

You can align text to the left, center, or right. This is accessible from the [bubble menu](#bubble-menu), the toolbar, or via keyboard shortcuts:

- **Align Left** - [`Mod+Shift+L`](/docs/general/keyboard-shortcuts)
- **Align Center** - [`Mod+Shift+E`](/docs/general/keyboard-shortcuts)
- **Align Right** - [`Mod+Shift+R`](/docs/general/keyboard-shortcuts)

## Lists

Three types of list are available: bullet lists, ordered (numbered) lists, and task lists.
You can create them via the toolbar menus, the [bubble menu](#bubble-menu), or keyboard shortcuts:

- **Bullet List** - type `-` followed by a space on a new line, or [`Mod+Shift+8`](/docs/general/keyboard-shortcuts)
- **Ordered List** - type `1.` followed by a space on a new line, or [`Mod+Shift+7`](/docs/general/keyboard-shortcuts)
- **Task List** - [`Mod+Shift+9`](/docs/general/keyboard-shortcuts)

While editing items in a list, press [`Tab`](/docs/general/keyboard-shortcuts) to nest an item deeper or [`Shift+Tab`](/docs/general/keyboard-shortcuts) to move it back out. Task list items have checkboxes you can click to mark things as done, which is handy for session prep checklists or tracking quest objectives.

## Links

You can add links to any selected text using [`Mod+Shift+K`](/docs/general/keyboard-shortcuts) or the link button in the [bubble menu](#bubble-menu).
A dialog will appear where you can enter a URL and optionally change the link's display text.

To edit or remove an existing link, click on it and use the options that appear.

## Horizontal Rule

Horizontal rules let you visually separate sections of a document.
You can insert one from the Insert menu in the toolbar, or by typing `---` on a new line followed by a space.

## Tables

Tables let you organize information into rows and columns.
To insert a table, open the **Insert** menu in the toolbar and hover over **Table**. You can choose **Blank Starter** to insert an empty table, or use [Autofill](#autofill) to generate a pre-filled table from text or a URL.

Once you click inside a table, a table menu will appear with options to:

- Insert or delete columns
- Insert or delete rows
- Toggle header rows, columns, or cells
- Delete the entire table

You can also resize columns by dragging the column borders.

## Media

You can add images, videos, audio files, and other files to your documents.
To insert a file, open the **Insert** menu in the toolbar and choose **File**, then pick a file from your device. You can also drag and drop a file directly into the editor, or paste it from your clipboard.

Images and videos can be resized by dragging their edges after they've been inserted.

## Monster Statblocks

Monster statblocks are special blocks designed for tabletop gaming content. To insert one, open the **Insert** menu in the toolbar and hover over **Monster Statblock** or **Wide Monster Statblock**. You can choose **Blank Starter** to insert a pre-formatted template, or use [Autofill](#autofill) to generate a statblock from text or a URL.

A blank statblock comes pre-filled with an example creature including armor class, hit points, ability scores, traits, and actions, ready for you to replace with your own creation. The wide variant gives you a two-column layout for creatures with more detailed stat blocks. Every field in the statblock is editable directly in place.

When you click inside a statblock, a small toolbar appears above it with options to copy the block to your clipboard, print it, or delete it.

## Spell, Item, and Feat Blocks

Spell blocks provide a formatted block for spells, items, feats, and similar content. To insert one, open the **Insert** menu in the toolbar and hover over **Spell, Item, Feat, etc.** You can choose **Blank Starter** to insert a template, or use [Autofill](#autofill) to generate a block from text or a URL.

A blank block comes with fields for key-value pairs (such as casting time, range, and components) and a description area. All fields are editable directly in place and you can add or remove key-value pairs to match whatever you're describing.

When you click inside a spell block, a small toolbar appears above it with options to copy, print, or delete it.

## Note Block

A note block is a visually distinct callout box, great for highlighting important information, DM tips, or flavor text. You can insert one from the **Insert** menu in the toolbar under **Note**.

When you click inside a note block, a small toolbar appears above it with options to copy, print, or delete it.

## Autofill

Autofill lets you turn unformatted text or web content into ready-to-use formatted content without having to structure everything by hand. Paste a wall of monster stats, drop in a URL from your favorite homebrew site, or paste in raw notes with any type of messy formatting, and FeyNote will parse and format it for you.

Autofill is available from the **Insert** menu in the toolbar. When you hover over **Monster Statblock**, **Wide Monster Statblock**, **Spell, Item, Feat, etc.**, or **Table**, a submenu appears with three options:

- **Blank Starter** inserts an empty template for you to fill in manually.
- **Autofill from Text** opens a dialog where you can paste or type content to be formatted.
- **Autofill from URL** opens a dialog where you can provide a link to a page containing the content you want to import.

For general-purpose text formatting, the **Insert** menu also includes an **Autoformatted Text** option. See [Autoformatted Text](#autoformatted-text) below.

### Autofill from Text

When you choose **Autofill from Text**, a dialog opens with a large text area. Paste or type the content you want to convert. This works well for content you've copied from a PDF, another app, or a chat message.

For example, you might paste a block of text like "Shadow Wraith, Neutral Evil, AC 15, HP 84, Speed 0 ft fly 60 ft..." and FeyNote will produce a properly formatted statblock.

### Autofill from URL

When you choose **Autofill from URL**, a dialog opens with a URL input field. Enter the address of a page that contains the content you want to import and FeyNote will fetch the page, extract the relevant information, and format it into the chosen block type. This is useful for pulling in content from wikis, homebrew sharing sites, or online references.

### Additional Instructions

Both modes include an optional instructions field below the main input. You can use this to give formatting hints or special requests, such as "convert hit points to average only" or "use metric units for distances".

### Previewing and Inserting

After entering your content, you have two options:

- **Preview** generates the formatted result and shows it in a preview dialog so you can check the output before committing. From the preview you can either go back to adjust your input or click **Insert** to add the content to your document.
- **Insert** skips the preview and places the formatted content directly into your document at the cursor position.

## Autoformatted Text

Autoformatted Text takes raw, unformatted text and converts it into well-structured rich text with proper headings, lists, tables, and other formatting applied automatically. This is useful when you have content copied from a PDF, a chat message, markdown, or plain-text notes that you want to clean up without manually formatting everything yourself.

To use it, open the **Insert** menu in the toolbar and choose **Autoformatted Text**. A dialog will open with a large text area where you can paste or type your content. Unlike the block-specific [Autofill](#autofill) options, Autoformatted Text produces general rich text rather than a statblock, spell block, or table.

You can optionally provide formatting hints in the instructions field, such as "use bullet points for the list of items" or "make the first line a heading". After entering your content, use **Preview** to check the result before inserting, or **Insert** to place the formatted text directly into your document.

## Dice Notation

The editor automatically recognizes dice notation in your text and highlights it. When you see highlighted dice notation, you can click on it to roll the dice and see the result.

Supported formats include:

- Standard rolls like `2d8+4`, `1d20`, `3d6-2`
- Combined rolls like `2d8 + 1d6 + 1d4 + 4`
- To-hit bonuses like `+11 to hit`
- Keep highest or lowest like `3d8kh` (keep highest) or `2d8kl` (keep lowest)

This means any dice notation you write in your monster statblocks, spell descriptions, or session notes is instantly rollable. No need to switch to a separate dice roller.

## Bubble Menu

When you select text, a floating toolbar appears with quick access to common formatting options.
From the bubble menu you can:

- Change the block style (paragraph, headings, lists)
- Change the font family
- Apply text formatting (bold, italic, underline, strikethrough)
- Set text alignment
- Adjust indentation
- Add or remove links

## Keyboard Shortcuts and References

For a complete list of all keyboard shortcuts, see [Keyboard Shortcuts](/docs/general/keyboard-shortcuts).

To learn about linking documents together using the `@` key, see [Document References](/docs/documents/references).
