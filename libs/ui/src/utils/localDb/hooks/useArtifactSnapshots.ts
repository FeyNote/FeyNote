import { useEffect, useMemo, useRef, useState } from 'react';
import { type ArtifactSnapshot } from '@feynote/global-types';
import { useHandleTRPCErrors } from '../../useHandleTRPCErrors';
import { trpc } from '../../trpc';
import { eventManager } from '../../../context/events/EventManager';
import { EventName } from '../../../context/events/EventName';
import { EventData } from '../../../context/events/EventData';

export const useArtifactSnapshots = (): {
  artifactSnapshots: ArtifactSnapshot[] | undefined;
} => {
  const [artifactSnapshots, setArtifactSnapshots] =
    useState<ReadonlyMap<string, ArtifactSnapshot>>();
  const artifactSnapshotsRef = useRef(artifactSnapshots);
  artifactSnapshotsRef.current = artifactSnapshots;
  const sessionInvalidationRef = useRef(Math.random());
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const fetchAll = async () => {
    const initialSession = sessionInvalidationRef.current;
    trpc.artifact.getArtifactSnapshots
      .query()
      .then((results) => {
        if (sessionInvalidationRef.current !== initialSession) return;

        const map = new Map(results.map((el) => [el.id, el]));
        setArtifactSnapshots(map);
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
  };
  useEffect(() => {
    fetchAll();

    eventManager.addEventListener(EventName.ArtifactUpdated, fetchAll);
    return () => {
      eventManager.removeEventListener(EventName.ArtifactUpdated, fetchAll);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      sessionInvalidationRef.current = Math.random();
      setArtifactSnapshots(undefined);

      fetchAll();
    };

    eventManager.addEventListener(EventName.LocaldbSessionUpdated, handler);
    return () => {
      eventManager.removeEventListener(
        EventName.LocaldbSessionUpdated,
        handler,
      );
    };
  }, []);

  const fetchSingle = async (artifactId: string) => {
    const initialSession = sessionInvalidationRef.current;
    trpc.artifact.getArtifactSnapshotById
      .query({
        id: artifactId,
      })
      .then((result) => {
        if (sessionInvalidationRef.current !== initialSession) return;

        const mutable = new Map(artifactSnapshotsRef.current);
        mutable.set(artifactId, result);
        setArtifactSnapshots(mutable);
        artifactSnapshotsRef.current = mutable;
      })
      .catch((e) => {
        handleTRPCErrors(e, {
          404: () => {
            const mutable = new Map(artifactSnapshotsRef.current);
            mutable.delete(artifactId);
            setArtifactSnapshots(mutable);
            artifactSnapshotsRef.current = mutable;
          },
        });
      });
  };
  useEffect(() => {
    const listener = (
      _: string,
      data: EventData[EventName.LocaldbArtifactSnapshotUpdated],
    ) => {
      fetchSingle(data.artifactId);
    };

    eventManager.addEventListener(
      EventName.LocaldbArtifactSnapshotUpdated,
      listener,
    );
    return () => {
      eventManager.removeEventListener(
        EventName.LocaldbArtifactSnapshotUpdated,
        listener,
      );
    };
  }, []);

  const hookResult = useMemo(
    () => ({
      artifactSnapshots: artifactSnapshots
        ? Array.from(artifactSnapshots.values())
        : undefined,
    }),
    [artifactSnapshots],
  );

  return hookResult;
};
