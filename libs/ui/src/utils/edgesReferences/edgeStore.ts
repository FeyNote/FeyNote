import { Edge, getEdgeId, GetEdgeIdArgs } from '@feynote/shared-utils';
import { trpc } from '../trpc';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';

/**
 * Please do not interact with this class directly from React if avoidable.
 * Use our many custom use* hooks instead.
 */
class EdgeStore {
  /**
   * Pseudo-react context like, that keeps track of what listeners are interested in what artifacts
   */
  private listenersForSpecificArtifactId: Record<string, Set<() => void>> = {};
  private listenersForAnyUpdate = new Set<() => void>();

  // These maps represent edges that are provided by server/indexeddb
  private fetchedOutgoingEdgesByArtifactId = new Map<string, Edge[]>();
  private fetchedIncomingEdgesByArtifactId = new Map<string, Edge[]>();
  /**
   * First level of map is the artifactId, second level is the blockId
   * We store this for performant lookups when showing the "(3)" on every block within documents, since
   * it's constantly pulled by every block shown on screen.
   */
  private fetchedIncomingEdgesByBlockIdByArtifactId = new Map<
    string,
    Map<string, Edge[]>
  >();

  // These maps represent edges that are provided by registered static providers.
  // These are only useful for artifacts that are not directly visible to the user, but could be browsed to.
  private staticOutgoingEdgesByArtifactId = new Map<string, Edge[]>();
  private staticIncomingEdgesByArtifactId = new Map<string, Edge[]>();
  private staticIncomingEdgesByBlockIdByArtifactId = new Map<
    string,
    Map<string, Edge[]>
  >();

  constructor() {
    eventManager.addEventListener(EventName.LocaldbSessionUpdated, async () => {
      this.fetchedIncomingEdgesByArtifactId.clear();
      this.fetchedOutgoingEdgesByArtifactId.clear();
      this.fetchedIncomingEdgesByBlockIdByArtifactId.clear();
      this.notify();
      this.loadAllEdges().then(() => {
        this.notify();
      });
    });
    eventManager.addEventListener(
      EventName.LocaldbEdgesUpdated,
      async (_, data) => {
        for (const artifactId of data.modifiedEdgeArtifactIds) {
          await this.loadArtifactEdges(artifactId);
        }
        this.notify(data.modifiedEdgeArtifactIds);
      },
    );
    eventManager.addEventListener(EventName.ArtifactUpdated, (_, data) => {
      this.loadArtifactEdges(data.artifactId);
      this.notify([data.artifactId]);
    });

    this.loadAllEdges().then(() => {
      this.notify();
    });

    // For contextless use within React
    this.provideStaticEdgesForArtifactId =
      this.provideStaticEdgesForArtifactId.bind(this);
    this.getEdgesForArtifactId = this.getEdgesForArtifactId.bind(this);
    this.getIncomingEdgesForBlock = this.getIncomingEdgesForBlock.bind(this);
    this.getEdge = this.getEdge.bind(this);
    this.listen = this.listen.bind(this);
    this.listenForArtifactId = this.listenForArtifactId.bind(this);
  }

  /**
   * For an external consumer of this class to provide some static edges that the local DB might not be aware of (for instance, a user viewing another user's artifact that isn't shared to them explicitly)
   * Note: When providing static edges, we do override previously provided static edges, which is fine because you assumedly have a newer copy
   */
  public provideStaticEdgesForArtifactId(args: {
    artifactId: string;
    outgoingEdges: Edge[];
    incomingEdges: Edge[];
  }) {
    const isArtifactTracked =
      this.fetchedIncomingEdgesByArtifactId.has(args.artifactId) ||
      this.fetchedOutgoingEdgesByArtifactId.has(args.artifactId);
    // We don't care about artifacts that we already track and are aware of. Only things we don't know about.
    if (isArtifactTracked) return;

    const actuallyHadContent =
      args.outgoingEdges.length || args.incomingEdges.length;
    // We really don't care if this method was called with just empty edge lists. No need to cause a re-render
    if (!actuallyHadContent) return;

    this.staticOutgoingEdgesByArtifactId.set(
      args.artifactId,
      args.outgoingEdges,
    );
    this.staticIncomingEdgesByArtifactId.set(
      args.artifactId,
      args.incomingEdges,
    );
    const incomingEdgesByBlockId = new Map<string, Edge[]>();
    for (const element of args.incomingEdges) {
      if (element.targetArtifactBlockId) {
        let block = incomingEdgesByBlockId.get(element.targetArtifactBlockId);
        if (!block) {
          block = [];
          incomingEdgesByBlockId.set(element.targetArtifactBlockId, block);
        }
        block.push(element);
      }
    }
    this.staticIncomingEdgesByBlockIdByArtifactId.set(
      args.artifactId,
      incomingEdgesByBlockId,
    );

    this.notify([args.artifactId]);
  }

  public getEdgesForArtifactId(artifactId: string): {
    incomingEdges: Edge[];
    outgoingEdges: Edge[];
  } {
    const incomingEdges =
      this.fetchedIncomingEdgesByArtifactId.get(artifactId) ||
      this.staticIncomingEdgesByArtifactId.get(artifactId);
    const outgoingEdges =
      this.fetchedOutgoingEdgesByArtifactId.get(artifactId) ||
      this.staticOutgoingEdgesByArtifactId.get(artifactId);

    return {
      incomingEdges: incomingEdges || [],
      outgoingEdges: outgoingEdges || [],
    };
  }

  public getIncomingEdgesForBlock(args: {
    artifactId: string;
    blockId: string;
  }): Edge[] {
    const incomingEdgesByBlockId =
      this.fetchedIncomingEdgesByBlockIdByArtifactId.get(args.artifactId) ||
      this.staticIncomingEdgesByBlockIdByArtifactId.get(args.artifactId);

    return incomingEdgesByBlockId?.get(args.blockId) || [];
  }

  /**
   * Use care when calling this rapid-fashion or attaching this to UI elements without memoization
   * it does have to loop mildly to find the desired edge. This is a trade-off instead of massively
   * increasing memory consumption.
   */
  public getEdge(args: GetEdgeIdArgs): Edge | undefined {
    const edgeId = getEdgeId(args);

    const incomingEdges =
      this.fetchedIncomingEdgesByArtifactId.get(args.targetArtifactId) ||
      this.staticIncomingEdgesByArtifactId.get(args.targetArtifactId);
    const incomingEdge = incomingEdges?.find(
      (edge) => getEdgeId(edge) === edgeId,
    );
    if (incomingEdge) return incomingEdge;

    const outgoingEdges =
      this.fetchedOutgoingEdgesByArtifactId.get(args.artifactId) ||
      this.staticOutgoingEdgesByArtifactId.get(args.artifactId);
    const outgoingEdge = outgoingEdges?.find(
      (edge) => getEdgeId(edge) === edgeId,
    );
    return outgoingEdge;
  }

  public listen(listener: () => void) {
    this.listenersForAnyUpdate.add(listener);

    return () => {
      this.listenersForAnyUpdate.delete(listener);
    };
  }

  public listenForArtifactId(artifactId: string, listener: () => void) {
    this.listenersForSpecificArtifactId[artifactId] ||= new Set();
    this.listenersForSpecificArtifactId[artifactId].add(listener);

    return () => {
      this.listenersForSpecificArtifactId[artifactId].delete(listener);
      if (this.listenersForSpecificArtifactId[artifactId].size === 0) {
        delete this.listenersForSpecificArtifactId[artifactId];
      }
    };
  }

  private async loadAllEdges() {
    const result = await trpc.artifact.getArtifactEdges.query().catch((e) => {
      console.error('Error while fetching edges', e);
    });
    if (!result) return;

    const fetchedOutgoingEdgesByArtifactId = new Map<string, Edge[]>();
    const fetchedIncomingEdgesByArtifactId = new Map<string, Edge[]>();
    const fetchedIncomingEdgesByBlockIdByArtifactId = new Map<
      string,
      Map<string, Edge[]>
    >();
    for (const element of result) {
      let outgoing = fetchedOutgoingEdgesByArtifactId.get(element.artifactId);
      if (!outgoing) {
        outgoing = [];
        fetchedOutgoingEdgesByArtifactId.set(element.artifactId, outgoing);
      }
      outgoing.push(element);

      let incoming = fetchedIncomingEdgesByArtifactId.get(
        element.targetArtifactId,
      );
      if (!incoming) {
        incoming = [];
        fetchedOutgoingEdgesByArtifactId.set(element.artifactId, incoming);
      }
      incoming.push(element);

      if (element.targetArtifactBlockId) {
        let artifactBlocks = fetchedIncomingEdgesByBlockIdByArtifactId.get(
          element.targetArtifactId,
        );
        if (!artifactBlocks) {
          artifactBlocks = new Map();
          fetchedIncomingEdgesByBlockIdByArtifactId.set(
            element.artifactId,
            artifactBlocks,
          );
        }
        let block = artifactBlocks.get(element.targetArtifactBlockId);
        if (!block) {
          block = [];
          artifactBlocks.set(element.targetArtifactBlockId, block);
        }
        block.push(element);
      }
    }

    this.fetchedOutgoingEdgesByArtifactId = fetchedOutgoingEdgesByArtifactId;
    this.fetchedIncomingEdgesByArtifactId = fetchedIncomingEdgesByArtifactId;
    this.fetchedIncomingEdgesByBlockIdByArtifactId =
      fetchedIncomingEdgesByBlockIdByArtifactId;
  }

  /**
   * Loads edges for a given artifact into our in-memory maps
   */
  private async loadArtifactEdges(artifactId: string) {
    const response = await trpc.artifact.getArtifactEdgesById
      .query({ id: artifactId })
      .catch((e) => {
        console.error('Error while fetching specific artifact edges', e);
      });

    if (!response) return;

    this.fetchedOutgoingEdgesByArtifactId.set(
      artifactId,
      response.outgoingEdges,
    );
    this.fetchedIncomingEdgesByArtifactId.set(
      artifactId,
      response.incomingEdges,
    );

    const incomingEdgesByBlockId = new Map<string, Edge[]>();
    for (const element of response.incomingEdges) {
      if (element.targetArtifactBlockId) {
        let block = incomingEdgesByBlockId.get(element.targetArtifactBlockId);
        if (!block) {
          block = [];
          incomingEdgesByBlockId.set(element.targetArtifactBlockId, block);
        }
        block.push(element);
      }
    }
    this.fetchedIncomingEdgesByBlockIdByArtifactId.set(
      artifactId,
      incomingEdgesByBlockId,
    );
  }

  /**
   * Notifies all of the listeners stored on this class.
   * If artifactIds argument is omitted, notifies all listeners.
   */
  private notify(artifactIds?: string[]) {
    let _artifactIds = artifactIds;
    if (!_artifactIds) {
      _artifactIds = Object.keys(this.listenersForSpecificArtifactId);
    }

    for (const artifactId of _artifactIds) {
      const listeners = this.listenersForSpecificArtifactId[artifactId];
      if (!listeners) {
        continue;
      }

      for (const listener of listeners) {
        listener();
      }
    }
    for (const listener of this.listenersForAnyUpdate) {
      listener();
    }
  }
}

let edgeStore: EdgeStore | null = null;
export const getEdgeStore = () => {
  if (!edgeStore) {
    edgeStore = new EdgeStore();
  }

  return edgeStore;
};
