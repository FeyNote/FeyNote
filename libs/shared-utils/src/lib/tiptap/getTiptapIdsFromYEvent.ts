import type { Item, XmlElement as YXmlElement, YEvent } from 'yjs';

export const getTiptapIdsFromYEvent = (yEvent: YEvent<YXmlElement>) => {
  // Yjs change target is simple, but we do recurse up the tree here to cover all nodes changed
  const getIdsFromChangeTarget = (node: YXmlElement): string[] => {
    const ids: string[] = [];

    const id = node.getAttribute?.('id');
    if (id) {
      ids.push(id);
    }

    if (node.parent)
      ids.push(...getIdsFromChangeTarget(node.parent as YXmlElement));

    return ids;
  };

  // From yjs delta format, we grab all ids up the tree stored as attributes by tiptap
  const getIdsFromDelta = (delta: Item): string[] => {
    const ids: string[] = [];

    if (!delta.content) return ids;

    const yContents = delta.content?.getContent();
    if (!yContents) return ids;

    for (const content of yContents) {
      ids.push(content._map?.get('id')?.content.getContent()[0]);

      if (content.parent) ids.push(...getIdsFromDelta(content.parent));
    }

    return ids;
  };

  // I don't completely understand why, but sometimes when
  // tiptap updates the ID for an existing node to a different ID,
  // the id gets put in this yEvent keys map
  const directId = yEvent.changes.keys.get('id')?.oldValue;

  // Delta captures any added or removed nodes
  const deltaAddRemoveIds = [...yEvent.changes.added, ...yEvent.changes.deleted]
    .map(getIdsFromDelta)
    .flat();

  // The change target must be used to cover when edits inside of a node are made, since
  // delta records only relative positions of edits
  const changeTargetIds = getIdsFromChangeTarget(yEvent.target);

  return [directId, ...changeTargetIds, ...deltaAddRemoveIds];
};
