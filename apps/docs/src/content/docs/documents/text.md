---
title: Text Documents
description: Create rich text documents with formatting, tables, media, dice rolling, and TTRPG statblocks.
---

## Overview

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
Insert a table using the Insert menu in the toolbar. It will start with a default set of rows and columns.

Once you click inside a table, a table menu will appear with options to:

- Insert or delete columns
- Insert or delete rows
- Toggle header rows, columns, or cells
- Delete the entire table

You can also resize columns by dragging the column borders.

## Media

You can add images, videos, audio files, and other files to your documents.
The easiest way is to drag and drop a file directly into the editor, or paste it from your clipboard.

Images and videos can be resized by dragging their edges after they've been inserted.

## Statblocks

FeyNote includes several special block types designed for tabletop gaming content. Each one can be inserted from the Insert menu in the toolbar and comes with a pre-formatted template that you can edit to fit your needs.

### Monster Statblock

A monster statblock comes pre-filled with an example creature including armor class, hit points, ability scores, traits, and actions, ready for you to replace with your own creation. A wide variant is also available for creatures with more detailed stat blocks if you prefer that style.

### Spell Block

A spell block provides a template with fields for casting time, range, components, duration, and the spell description.

### Note Block

A stylized note is a visually distinct callout box, great for highlighting important information, DM tips, or flavor text.

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
