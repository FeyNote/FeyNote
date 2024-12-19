import { Edge, getEdgeId, GetEdgeIdArgs } from '@feynote/shared-utils';
import { trpc } from '../trpc';

class EdgeStore {
  private readonly CLEANUP_INTERVAL_SECONDS = 60;

  /**
   * For communicating with the service worker (it publishes on this channel every sync)
   */
  private broadcastChannel = new BroadcastChannel('edges.updated');
  /**
   * For keeping track of what edges we actually care about so we don't
   * have to keep all edges in the user's collection in memory
   */
  private watchedEdges = new Set<string>();
  /**
   * Pseudo-react context like, that keeps track of what listeners are interested in what artifacts
   */
  private listenersByArtifactId: Record<string, Set<() => void>> = {};

  // These maps represent edges that are provided by IndexedDB
  private localOutgoingEdgesByArtifactId = new Map<string, Edge[]>();
  private localIncomingEdgesByArtifactId = new Map<string, Edge[]>();
  // These maps represent edges that are provided by registered static providers
  private staticOutgoingEdgesByArtifactId = new Map<string, Edge[]>();
  private staticIncomingEdgesByArtifactId = new Map<string, Edge[]>();

  // These maps represent edges as a total source of truth
  private outgoingEdgesByArtifactId = new Map<string, Edge[]>();
  private incomingEdgesByArtifactId = new Map<string, Edge[]>();

  constructor() {
    // Cleanup unwatched edges from memory
    setInterval(() => {
      for (const artifactId of this.localOutgoingEdgesByArtifactId.keys()) {
        if (!this.listenersByArtifactId[artifactId]) {
          this.watchedEdges.delete(artifactId);
          this.localOutgoingEdgesByArtifactId.delete(artifactId);
        }
      }
      for (const artifactId of this.localIncomingEdgesByArtifactId.keys()) {
        if (!this.listenersByArtifactId[artifactId]) {
          this.watchedEdges.delete(artifactId);
          this.localIncomingEdgesByArtifactId.delete(artifactId);
        }
      }
    }, this.CLEANUP_INTERVAL_SECONDS);

    this.broadcastChannel.addEventListener('message', async (event) => {
      const aritfactIdsWithUpdatedEdges = event.data.modifiedEdgeArtifactIds;

      for (const artifactId of aritfactIdsWithUpdatedEdges) {
        if (this.watchedEdges.has(artifactId)) {
          await this.loadArtifactEdges(artifactId);

          this.notifyArtifactListeners(artifactId);
        }
      }
    });
  }

  private updateTrackedEdges(artifactId: string) {
    const localIncomingEdges =
      this.localIncomingEdgesByArtifactId.get(artifactId) || [];
    const localOutgoingEdges =
      this.localOutgoingEdgesByArtifactId.get(artifactId) || [];
    const staticIncomingEdges =
      this.staticIncomingEdgesByArtifactId.get(artifactId) || [];
    const staticOutgoingEdges =
      this.staticOutgoingEdgesByArtifactId.get(artifactId) || [];

    const outgoingEdgesWithDupes = [
      ...localOutgoingEdges,
      ...staticOutgoingEdges,
    ];
    const incomingEdgesWithDupes = [
      ...localIncomingEdges,
      ...staticIncomingEdges,
    ];

    const outgoingEdgesMap = new Map<string, Edge>(
      outgoingEdgesWithDupes.map((edge) => [edge.id, edge]),
    );
    this.outgoingEdgesByArtifactId.set(
      artifactId,
      Array.from(outgoingEdgesMap.values()),
    );

    const incomingEdgesMap = new Map<string, Edge>(
      incomingEdgesWithDupes.map((edge) => [edge.id, edge]),
    );
    this.incomingEdgesByArtifactId.set(
      artifactId,
      Array.from(incomingEdgesMap.values()),
    );
  }

  private notifyArtifactListeners(artifactId: string) {
    const listeners = this.listenersByArtifactId[artifactId];
    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener();
    }
  }

  /**
   * Local idb edges have undefined values as '' for index purposes. We want to convert those to undefined
   */
  private idbEdgeToTypedEdge(edge: any): Edge {
    return {
      id: getEdgeId(edge),
      artifactTitle: edge.artifactTitle,
      artifactId: edge.artifactId,
      artifactBlockId: edge.artifactBlockId,
      targetArtifactId: edge.targetArtifactId,
      targetArtifactBlockId: edge.targetArtifactBlockId || undefined,
      targetArtifactDate: edge.targetArtifactDate || undefined,
      referenceText: edge.referenceText,
      isBroken: edge.isBroken,
    };
  }

  /**
   * Loads edges for a given artifact from IndexedDB into our in-memory maps
   */
  private async loadArtifactEdges(artifactId: string) {
    const response = await trpc.artifact.getArtifactEdgesById
      .query({ id: artifactId })
      .catch(() => {
        return {
          outgoingEdges: [] as Edge[],
          incomingEdges: [] as Edge[],
        };
      });

    if (!response) return;

    this.localOutgoingEdgesByArtifactId.set(
      artifactId,
      response.outgoingEdges.map(this.idbEdgeToTypedEdge),
    );
    this.localIncomingEdgesByArtifactId.set(
      artifactId,
      response.incomingEdges.map(this.idbEdgeToTypedEdge),
    );

    this.updateTrackedEdges(artifactId);
  }

  /**
   * For an external consumer of this class to provide some static edges that the local DB might not be aware of (for instance, a user viewing another user's artifact that isn't shared to them explicitly)
   * Note: Intended limitation is that there be only one provider per artifactId
   */
  public async provideStaticEdgesForArtifactId(opts: {
    artifactId: string;
    outgoingEdges: Edge[];
    incomingEdges: Edge[];
  }) {
    const { artifactId, outgoingEdges, incomingEdges } = opts;

    if (
      this.staticOutgoingEdgesByArtifactId.has(artifactId) ||
      this.staticIncomingEdgesByArtifactId.has(artifactId)
    ) {
      // We could allow this, but if this ever happens, we've made a mistake elsewhere
      throw new Error(
        `Static edges for artifact ${artifactId} already provided`,
      );
    }

    this.staticOutgoingEdgesByArtifactId.set(artifactId, outgoingEdges);
    this.staticIncomingEdgesByArtifactId.set(artifactId, incomingEdges);

    this.updateTrackedEdges(artifactId);

    this.notifyArtifactListeners(artifactId);

    // Cleanup/unregister (for use in React)
    return () => {
      this.staticOutgoingEdgesByArtifactId.delete(artifactId);
      this.staticIncomingEdgesByArtifactId.delete(artifactId);

      this.updateTrackedEdges(artifactId);

      this.notifyArtifactListeners(artifactId);
    };
  }

  public getEdgesForArtifactId(artifactId: string): {
    incomingEdges: Edge[];
    outgoingEdges: Edge[];
    getEdge: (args: GetEdgeIdArgs) => Edge | undefined;
  } {
    return {
      incomingEdges: this.incomingEdgesByArtifactId.get(artifactId) || [],
      outgoingEdges: this.outgoingEdgesByArtifactId.get(artifactId) || [],
      getEdge: (args: GetEdgeIdArgs) => {
        const edgeId = getEdgeId(args);

        const incomingEdge = this.incomingEdgesByArtifactId
          .get(args.targetArtifactId)
          ?.find((edge) => getEdgeId(edge) === edgeId);
        const outgoingEdge = this.outgoingEdgesByArtifactId
          .get(args.artifactId)
          ?.find((edge) => getEdgeId(edge) === edgeId);

        const edge = incomingEdge || outgoingEdge;
        console.log('getting edge', edge?.referenceText);

        return edge;
      },
    };
  }

  public getEdgeInstant(args: GetEdgeIdArgs): Edge | undefined {
    const edgeId = getEdgeId(args);

    const incomingEdge = this.incomingEdgesByArtifactId
      .get(args.targetArtifactId)
      ?.find((edge) => getEdgeId(edge) === edgeId);
    const outgoingEdge = this.outgoingEdgesByArtifactId
      .get(args.artifactId)
      ?.find((edge) => getEdgeId(edge) === edgeId);

    return incomingEdge || outgoingEdge;
  }

  public listenForArtifactId(artifactId: string, listener: () => void) {
    this.listenersByArtifactId[artifactId] ||= new Set();
    this.listenersByArtifactId[artifactId].add(listener);

    if (!this.watchedEdges.has(artifactId)) {
      this.watchedEdges.add(artifactId);
      this.loadArtifactEdges(artifactId).then(() => {
        this.notifyArtifactListeners(artifactId);
      });
    }

    return () => {
      this.listenersByArtifactId[artifactId].delete(listener);
      if (this.listenersByArtifactId[artifactId].size === 0) {
        delete this.listenersByArtifactId[artifactId];
      }
    };
  }
}

let edgeStore: EdgeStore | null = null;
export const getEdgeStore = () => {
  if (!edgeStore) {
    edgeStore = new EdgeStore();
  }

  return edgeStore;
};
