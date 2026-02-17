---
title: Document Tree
description: Organize your documents into a hierarchical folder structure using drag and drop.
---

The document tree is a hierarchical sidebar for organizing your documents into a folder-like structure. You'll find it in the [left side menu](/docs/general/layout/desktop-panes#left-side-menu) under "Your Tree". Any document can act as a folder containing other documents, so you can build nested structures that mirror how you think about your world, campaign, or project.

## Organizing Documents

Drag and drop documents within the tree to rearrange them. You can nest a document inside another document by dropping it on top, turning the target into a folder. Where you drop a document among its siblings determines its position in the list.

You can also drag documents between the tree and your [panes](/docs/general/layout/desktop-panes) to open them in new splits or tabs.

## Uncategorized

Documents that haven't been placed in the tree appear in a section called "Uncategorized" at the bottom. To organize a document, drag it out of Uncategorized and drop it where you'd like it in the tree. Dropping a document back onto Uncategorized removes it from the tree.

If you prefer a cleaner look and don't care about uncategorized items, you can hide this section in [settings](/docs/settings/general#document-tree).

## Expanding and Collapsing

Documents that contain children show an arrow you can click to expand or collapse them. You can also double-click a document to both open it and expand it at once. Single-clicking navigates to the document, and Mod+click opens it in a new tab. The items you expand or collapse are remembered across sessions, so when you re-open the app you'll see the tree in the same state that you left it.

If you'd like the tree to automatically scroll and expand to show whichever document you're currently viewing, turn on "Automatically reveal documents within tree" in [settings](/docs/settings/general#document-tree).

## Context Menu

Right-clicking a document in the tree opens a context menu with the following options:

- **Expand all** and **Collapse all** to open or close all descendants at once
- **Split right** and **Split down** to open the document in a new [pane](/docs/general/layout/desktop-panes)
- **New tab** to open the document in a new tab
- **New Document as Tree Child** to create a new document nested inside the one you clicked
- **Delete Document** to delete the document

## Creating Documents in the Tree

To create a document that's already nested inside another, right-click the parent document in the tree and choose **New Document as Tree Child**. This option is also available from the **File** menu in the toolbar when you have a document open. You'll be asked to pick a document type (text, calendar, or drawing), and the new document will be created as a child of the selected parent.

## Moving Multiple Documents

If you need to reorganize several documents at once, open **All Documents**, select the documents you want to move, then choose **Move Within Your Tree** from the **Actions** menu. A tree picker will appear where you can click a target parent. After confirming the move, all selected documents will be placed inside that parent.

## Settings

A few settings in [Settings > Interface > Document Tree](/docs/settings/general#document-tree) let you control how the tree behaves:

- **Show document tree in left menu** toggles the tree on or off.
- **Automatically reveal documents within tree** makes the tree scroll and expand to highlight the document you're currently viewing.
- **Show uncategorized documents section in document tree** shows or hides the [Uncategorized](#uncategorized) section.

## Graph Integration

The relationships in your document tree also appear in the [document graph](/docs/documents/graph). Tree relations are shown as dashed lines between parent and child documents, giving you a visual overview of your organizational structure alongside your [reference](/docs/documents/references) connections. You can toggle tree relations on or off from the graph's settings panel.
