import { Doc as YDoc, applyUpdate } from 'yjs';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTiptapContentFromYjsDoc,
  getTiptapServerExtensions,
  TLDRAW_YDOC_STORE_KEY,
} from '@feynote/shared-utils';
import { generateHTML } from '@tiptap/html';
import { trpc } from '../trpc';
import { getElectronAPI } from '../electronAPI';
import { getExportFilename } from './getExportFilename';
import { htmlToMarkdown } from './htmlToMarkdown';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import type { ArtifactType } from '@prisma/client';
import { getArtifactSnapshotStore } from '../localDb/artifactSnapshots/artifactSnapshotStore';

interface ManifestEntry {
  filename: string;
  type: ArtifactType;
  title: string;
}

interface LiveExportManifest {
  version: 1;
  entries: Record<string, ManifestEntry>;
}

const MANIFEST_FILENAME = '.feynote-export.json';
const DEBOUNCE_MS = 2500;

export class LiveExportManager {
  private exportPath: string | null = null;
  private manifest: LiveExportManifest = { version: 1, entries: {} };
  private activeObservers = new Map<string, () => void>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private syncEventListener:
    | ((
        eventName: EventName.LocaldbArtifactSnapshotUpdated,
        data: { artifactId: string },
      ) => void)
    | null = null;

  async setExportPath(path: string | null) {
    this.stopListening();
    this.exportPath = path;

    if (!path) {
      this.manifest = { version: 1, entries: {} };
      return;
    }

    await this.loadOrCreateManifest();
    this.startListening();
  }

  async runBulkExport(
    progressCallback?: (current: number, total: number) => void,
  ) {
    const artifactSnapshots = getArtifactSnapshotStore().getArtifactSnapshots();
    const total = artifactSnapshots.length;

    progressCallback?.(0, total);

    let current = 0;
    for (const snapshot of artifactSnapshots) {
      await this.exportArtifactByYBin(snapshot.id, false).catch((e) => {
        console.error(
          `[LiveExport] Failed to export artifact ${snapshot.id}:`,
          e,
        );
      });
      current++;
      progressCallback?.(current, total);
    }

    await this.saveManifest();
  }

  async exportArtifactByYBin(artifactId: string, saveManifest = true) {
    const electronAPI = getElectronAPI();
    if (!electronAPI || !this.exportPath) return;

    const response = await trpc.artifact.getArtifactYBinById.query({
      id: artifactId,
    });

    const yDoc = new YDoc();
    applyUpdate(yDoc, response.yBin);

    const meta = getMetaFromYArtifact(yDoc);

    if (meta.type === 'calendar') {
      yDoc.destroy();
      return;
    }

    if (meta.deletedAt) {
      await this.handleArtifactDeletion(artifactId);
      yDoc.destroy();
      return;
    }

    await this.writeArtifactFile(artifactId, yDoc, meta.type, meta.title);
    yDoc.destroy();

    if (saveManifest) {
      await this.saveManifest();
    }
  }

  observeArtifact(artifactId: string, yDoc: YDoc, type: ArtifactType): void {
    if (type === 'calendar') return;

    if (this.activeObservers.has(artifactId)) return;

    const electronAPI = getElectronAPI();
    if (!electronAPI || !this.exportPath) return;

    const handler = () => {
      this.debouncedExportFromDoc(artifactId, yDoc, type);
    };

    const metaMap = yDoc.getMap(ARTIFACT_META_KEY);
    metaMap.observe(handler);

    switch (type) {
      case 'tiptap': {
        const fragment = yDoc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY);
        fragment.observeDeep(handler);
        this.activeObservers.set(artifactId, () => {
          fragment.unobserveDeep(handler);
          metaMap.unobserve(handler);
        });
        break;
      }
      case 'tldraw': {
        const array = yDoc.getArray(TLDRAW_YDOC_STORE_KEY);
        array.observeDeep(handler);
        this.activeObservers.set(artifactId, () => {
          array.unobserveDeep(handler);
          metaMap.unobserve(handler);
        });
        break;
      }
    }

    handler();
  }

  unobserveArtifact(artifactId: string) {
    const cleanup = this.activeObservers.get(artifactId);
    if (cleanup) {
      cleanup();
      this.activeObservers.delete(artifactId);
    }

    const timer = this.debounceTimers.get(artifactId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(artifactId);
    }
  }

  async handleArtifactDeletion(artifactId: string) {
    const electronAPI = getElectronAPI();
    if (!electronAPI || !this.exportPath) return;

    const entry = this.manifest.entries[artifactId];
    if (!entry) return;

    const deletedFilename = `DELETED - ${entry.filename}`;
    await electronAPI.renameFile(
      `${this.exportPath}/${entry.filename}`,
      `${this.exportPath}/${deletedFilename}`,
    );

    delete this.manifest.entries[artifactId];
    await this.saveManifest();
  }

  private async writeArtifactFile(
    artifactId: string,
    yDoc: YDoc,
    type: ArtifactType,
    title: string,
  ) {
    const electronAPI = getElectronAPI();
    if (!electronAPI || !this.exportPath) return;

    const content = this.extractContent(yDoc, type);
    const newFilename = getExportFilename(title, artifactId, type);

    const existingEntry = this.manifest.entries[artifactId];
    if (existingEntry && existingEntry.filename !== newFilename) {
      await electronAPI.renameFile(
        `${this.exportPath}/${existingEntry.filename}`,
        `${this.exportPath}/${newFilename}`,
      );
    }

    await electronAPI.writeFile(`${this.exportPath}/${newFilename}`, content);

    this.manifest.entries[artifactId] = {
      filename: newFilename,
      type,
      title,
    };
  }

  private extractContent(yDoc: YDoc, type: ArtifactType): string {
    switch (type) {
      case 'tiptap': {
        const jsonContent = getTiptapContentFromYjsDoc(
          yDoc,
          ARTIFACT_TIPTAP_BODY_KEY,
        );
        const extensions = getTiptapServerExtensions({});
        const html = generateHTML(jsonContent, extensions);
        return htmlToMarkdown(html);
      }
      case 'tldraw': {
        const records = yDoc.getArray(TLDRAW_YDOC_STORE_KEY).toJSON();
        return JSON.stringify(records, null, 2);
      }
      default: {
        return '';
      }
    }
  }

  private debouncedExportFromDoc(
    artifactId: string,
    yDoc: YDoc,
    type: ArtifactType,
  ) {
    if (type === 'calendar') return;

    const existing = this.debounceTimers.get(artifactId);
    if (existing) clearTimeout(existing);

    this.debounceTimers.set(
      artifactId,
      setTimeout(async () => {
        this.debounceTimers.delete(artifactId);

        if (!this.exportPath) return;

        const meta = getMetaFromYArtifact(yDoc);

        if (meta.deletedAt) {
          await this.handleArtifactDeletion(artifactId);
          return;
        }

        await this.writeArtifactFile(artifactId, yDoc, type, meta.title);
        await this.saveManifest();
      }, DEBOUNCE_MS),
    );
  }

  private startListening() {
    this.syncEventListener = (_, data) => {
      if (this.activeObservers.has(data.artifactId)) return;

      const existing = this.debounceTimers.get(data.artifactId);
      if (existing) clearTimeout(existing);

      this.debounceTimers.set(
        data.artifactId,
        setTimeout(async () => {
          this.debounceTimers.delete(data.artifactId);
          await this.exportArtifactByYBin(data.artifactId).catch((e) => {
            console.error(
              `[LiveExport] Failed to export artifact ${data.artifactId} from sync:`,
              e,
            );
          });
        }, DEBOUNCE_MS),
      );
    };

    eventManager.addEventListener(
      EventName.LocaldbArtifactSnapshotUpdated,
      this.syncEventListener,
    );
  }

  private stopListening() {
    if (this.syncEventListener) {
      eventManager.removeEventListener(
        EventName.LocaldbArtifactSnapshotUpdated,
        this.syncEventListener,
      );
      this.syncEventListener = null;
    }

    for (const [artifactId, cleanup] of this.activeObservers) {
      cleanup();
      const timer = this.debounceTimers.get(artifactId);
      if (timer) clearTimeout(timer);
    }
    this.activeObservers.clear();
    this.debounceTimers.clear();
  }

  private async loadOrCreateManifest() {
    const electronAPI = getElectronAPI();
    if (!electronAPI || !this.exportPath) return;

    const manifestPath = `${this.exportPath}/${MANIFEST_FILENAME}`;
    const content = await electronAPI.readFile(manifestPath);

    if (content) {
      try {
        this.manifest = JSON.parse(content);
        return;
      } catch {
        // Corrupted manifest, start fresh
      }
    }

    this.manifest = { version: 1, entries: {} };
    await this.saveManifest();
  }

  private async saveManifest() {
    const electronAPI = getElectronAPI();
    if (!electronAPI || !this.exportPath) return;

    const manifestPath = `${this.exportPath}/${MANIFEST_FILENAME}`;
    await electronAPI.writeFile(
      manifestPath,
      JSON.stringify(this.manifest, null, 2),
    );
  }
}

let liveExportManager: LiveExportManager | null = null;
export const getLiveExportManager = (): LiveExportManager => {
  if (!liveExportManager) {
    liveExportManager = new LiveExportManager();
  }
  return liveExportManager;
};
