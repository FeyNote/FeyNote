---
title: Artifact References
description: References between artifacts
---

References between artifacts are a powerful way to connect different artifacts together.
When crafting your world, there will often be content that you want to link.

A common usecase is to link a monster to a location where it is found. You might have 3 dungeons that use the same custom monster.

## Creating References

To create a reference, you can use the `@` key.
This will bring up a list of artifacts that you can reference.
You can filter this list by typing the name of the artifact you want to reference.
Press `enter` or click an artifact to create a reference to it.

When creating a reference, you'll not only artifacts, but also paragraphs, headers, and other blocks within an artifact.
This allows you to create deeply nested references and avoid duplicating content in various locations.

## Interacting with References

When you hover over a reference, you'll see a preview of the artifact that it references.
You can click on the reference to open the artifact that's linked.
A reference will also show up in the [artifact graph](/docs/artifacts/graph) as a connection between two nodes.
This allows you to create complex relationships between content that far exceeds what you can do with a traditional tree structure.

## Keeping References Up to Date

When you rename an artifact, or update a referenced block, all references to it will be updated automatically.
No action is needed to keep your references up to date.
