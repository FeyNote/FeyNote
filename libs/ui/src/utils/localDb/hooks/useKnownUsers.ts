import { useEffect, useMemo, useRef, useState } from 'react';
import { useHandleTRPCErrors } from '../../useHandleTRPCErrors';
import { trpc } from '../../trpc';
import { eventManager } from '../../../context/events/EventManager';
import { EventName } from '../../../context/events/EventName';
import type { KnownUserDoc } from '../../localDb';

export const useKnownUsers = (): {
  knownUsers: KnownUserDoc[] | undefined;
  knownUsersById: ReadonlyMap<string, KnownUserDoc> | undefined;
} => {
  const [knownUsers, setKnownUsers] =
    useState<ReadonlyMap<string, KnownUserDoc>>();
  const artifactSnapshotsRef = useRef(knownUsers);
  artifactSnapshotsRef.current = knownUsers;
  const sessionInvalidationRef = useRef(Math.random());
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const fetchAll = async () => {
    const initialSession = sessionInvalidationRef.current;
    trpc.user.getKnownUsers
      .query()
      .then((results) => {
        if (sessionInvalidationRef.current !== initialSession) return;

        const map = new Map(results.map((el) => [el.id, el]));
        setKnownUsers(map);
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
  };
  useEffect(() => {
    fetchAll();

    eventManager.addEventListener(EventName.ArtifactUpdated, fetchAll);
    eventManager.addEventListener(EventName.LocaldbKnownUsersUpdated, fetchAll);
    return () => {
      eventManager.removeEventListener(EventName.ArtifactUpdated, fetchAll);
      eventManager.removeEventListener(
        EventName.LocaldbKnownUsersUpdated,
        fetchAll,
      );
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      sessionInvalidationRef.current = Math.random();
      setKnownUsers(undefined);

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

  const hookResult = useMemo(
    () => ({
      knownUsers: knownUsers ? Array.from(knownUsers.values()) : undefined,
      knownUsersById: knownUsers,
    }),
    [knownUsers],
  );

  return hookResult;
};
