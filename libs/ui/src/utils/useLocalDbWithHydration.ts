import type { Resolver } from "@trpc/client";
import { trpc } from "./trpc";
import { eventManager } from "../context/events/EventManager";
import { useEffect } from "react";

export enum LocalDBTopic {
  Artifacts = 'artifacts',
};

const subscribedTopicsByProcedureKey = new Map<Resolver<any>, LocalDBTopic[]>([
  [trpc.artifact.getArtifacts.query, [LocalDBTopic.Artifacts]]
]);

export const useLocalDbWithHydration = (
  procedure: Resolver<any>,
) => {
  const subscribedTopics = subscribedTopicsByProcedureKey.get(procedure) || [];

  useEffect(() => {
    eventManager.addEventListener();
  }, [procedure]);
}
