import { useEffect, useState } from 'react';

/**
 * This method is only intended for use within ArtifactTree and does not support any sort of global state
 */
export const useTreeExpandedItems = (
  currentWorkspaceId: string | null,
  enableOpenItemMemory: boolean | undefined,
) => {
  // For now we store this in localStorage since preferences service doesn't support arbitrary keys (and likely never will)
  const expandedItemsStorageKey = currentWorkspaceId
    ? `workspaceTreeExpandedItemIds_${currentWorkspaceId}`
    : 'userTreeExpandedItemIds';
  const loadExpandedItems = (): string[] => {
    if (!enableOpenItemMemory) return [];

    try {
      const mem = JSON.parse(
        localStorage.getItem(expandedItemsStorageKey) || '[]',
      );
      if (Array.isArray(mem)) return mem;
      return [];
    } catch (_e) {
      return [];
    }
  };
  const [expandedItems, _setExpandedItems] = useState<string[]>(() => {
    return loadExpandedItems();
  });
  const setExpandedItems = (val: string[]) => {
    _setExpandedItems(val);
    setTimeout(() => {
      localStorage.setItem(
        expandedItemsStorageKey,
        JSON.stringify(expandedItems),
      );
    });
  };
  useEffect(() => {
    _setExpandedItems(loadExpandedItems());
  }, [currentWorkspaceId]);

  return {
    expandedItems,
    setExpandedItems,
  };
};
