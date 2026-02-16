---
title: Document Graph
description: A visual representation of the relationships between your documents.
---

The document graph is a visual representation of the relationships between your documents.
It is a powerful tool for understanding the structure of your project and for identifying clusters of knowledge.

## Relation Types

The graph displays two types of relationships between documents.

### Reference Relations

Reference relations are created when you reference one document from another using `@`. These are shown as solid lines with directional arrows indicating which document references which. You can show and hide this behavior using the [show reference relations](#show-reference-relations) option.

See [Document References](/docs/documents/references) for more on creating and managing references.

### Tree Relations

Tree relations are derived from the parent-child hierarchy in your document tree. These are shown as dashed lines without arrows, and are useful for visualizing how your documents are organized structurally. You can show and hide this behavior using the [show tree relations](#show-tree-relations) option.

## Interacting with the Graph

- Hover over a node to highlight its direct connections
- Click a node to open that document (mod+click to open in a new tab)
- Drag nodes to reposition them (you can use the [lock in place on drag](#lock-in-place-on-drag) feature to keep them where you put them)
- Zoom and pan by clicking and holding on an empty portion of the graph canvas

## Graph Settings

Settings are available in the right sidebar and persist across sessions and clients (if settings sync is enabled).

### Show Orphaned Documents

Orphaned documents are documents that have no connections to other documents. Disabling this setting will hide them from the graph, which can be useful if your collection has stray documents that aren't linked to anything else and you'd like to hide those.

### Show Reference Relations

Toggles the visibility of [reference-based](#reference-relations) links in the graph. When enabled, you'll see relationship lines drawn between documents that point to one another using an [`@` reference](/docs/documents/references).

### Show Tree Relations

Toggles the visibility of [tree hierarchy](#tree-relations) links in the graph. When enabled, you'll see relationship lines drawn between documents that are related to each other within the tree via a parent-child relationship.

### Lock In Place on Drag

When enabled, dragging a node locks it in that position. This lets you organize your graph into sections manually. Locked documents appear in a list below the settings, where they can be individually unlocked.
