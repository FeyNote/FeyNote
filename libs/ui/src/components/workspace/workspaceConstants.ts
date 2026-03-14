import type { IconType } from 'react-icons';
import {
  LuFolder,
  LuGlobe,
  LuBriefcase,
  LuBook,
  LuShield,
  LuSword,
  LuCastle,
  LuMap,
  LuUsers,
  FaStar,
  FaHeart,
  FaFlag,
  LuCompass,
  LuCrown,
  LuScroll,
  LuFeather,
  LuFlame,
  LuGem,
  LuLandmark,
  LuTelescope,
} from '../AppIcons';

export const WORKSPACE_ICONS: { id: string; icon: IconType }[] = [
  { id: 'folder', icon: LuFolder },
  { id: 'globe', icon: LuGlobe },
  { id: 'briefcase', icon: LuBriefcase },
  { id: 'book', icon: LuBook },
  { id: 'shield', icon: LuShield },
  { id: 'sword', icon: LuSword },
  { id: 'castle', icon: LuCastle },
  { id: 'map', icon: LuMap },
  { id: 'users', icon: LuUsers },
  { id: 'star', icon: FaStar },
  { id: 'heart', icon: FaHeart },
  { id: 'flag', icon: FaFlag },
  { id: 'compass', icon: LuCompass },
  { id: 'crown', icon: LuCrown },
  { id: 'scroll', icon: LuScroll },
  { id: 'feather', icon: LuFeather },
  { id: 'flame', icon: LuFlame },
  { id: 'gem', icon: LuGem },
  { id: 'landmark', icon: LuLandmark },
  { id: 'telescope', icon: LuTelescope },
];

export const WORKSPACE_ICON_BY_ID = new Map(
  WORKSPACE_ICONS.map((entry) => [entry.id, entry.icon]),
);

export const WORKSPACE_COLORS = [
  '#dc2626', // red
  '#f43f5e', // rose
  '#f97316', // orange
  '#b45309', // amber brown
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#0d9488', // dark teal
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky blue
  '#3b82f6', // blue
  '#1e40af', // navy
  '#6366f1', // indigo
  '#7c3aed', // deep violet
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#64748b', // slate
];
