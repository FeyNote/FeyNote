const STORAGE_KEY = 'headingCollapseState';

const cache = new Map<string, ReadonlySet<string>>();
let loaded = false;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function loadFromStorage() {
  if (loaded) return;
  loaded = true;
  if (!hasLocalStorage()) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored) as Record<string, string[]>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
    for (const [artifactId, ids] of Object.entries(parsed)) {
      if (Array.isArray(ids)) {
        cache.set(artifactId, new Set(ids));
      }
    }
  } catch {
    // noop
  }
}

function flushSave() {
  if (!saveTimeout) return;
  clearTimeout(saveTimeout);
  saveTimeout = null;
  const data: Record<string, string[]> = {};
  for (const [artifactId, ids] of cache) {
    data[artifactId] = [...ids];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function scheduleSave() {
  if (!hasLocalStorage()) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(flushSave, 500);
}

if (hasLocalStorage()) {
  window.addEventListener('beforeunload', flushSave);
}

export function getCollapsedHeadingIds(
  artifactId: string,
): ReadonlySet<string> {
  loadFromStorage();
  return cache.get(artifactId) ?? new Set();
}

export function setCollapsedHeadingIds(
  artifactId: string,
  ids: ReadonlySet<string>,
) {
  loadFromStorage();
  if (ids.size === 0) {
    cache.delete(artifactId);
  } else {
    cache.set(artifactId, ids);
  }
  scheduleSave();
}
