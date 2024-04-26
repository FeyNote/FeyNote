import {
  cityTownRootTemplate,
  dungeonRoomRootTemplate,
  dungeonRootTemplate,
  genericLocationRootTemplate,
  itemRootTemplate,
  npcRootTemplate,
  playerRootTemplate,
  questRootTemplate,
  regionRootTemplate,
  religionRootTemplate,
  shopTavernRootTemplate,
  worldRootTemplate,
} from './basicTemplates';
import { RootTemplate } from './rootTemplates.types';

export const rootTemplates = [
  worldRootTemplate,
  regionRootTemplate,
  genericLocationRootTemplate,
  cityTownRootTemplate,
  dungeonRootTemplate,
  dungeonRoomRootTemplate,
  npcRootTemplate,
  shopTavernRootTemplate,
  playerRootTemplate,
  itemRootTemplate,
  questRootTemplate,
  religionRootTemplate,
] satisfies RootTemplate[];

export const rootTemplatesById = rootTemplates.reduce((acc, rootTemplate) => {
  acc[rootTemplate.id] = rootTemplate;
  return acc;
}, {} as Record<string, RootTemplate>);
console.log(rootTemplates);
