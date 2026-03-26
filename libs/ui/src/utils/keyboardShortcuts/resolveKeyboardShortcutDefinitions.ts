import type { KeyboardShortcutOverride } from '@feynote/shared-utils';
import {
  type ShortcutDefinition,
  type ShortcutEntry,
  type ShortcutName,
  KEYBOARD_SHORTCUTS,
} from './KEYBOARD_SHORTCUTS';
import { isKeyboardShortcutDualVariant } from './isKeyboardShortcutDualVariant';

export const resolveKeyboardShortcutDefinitions = (
  name: ShortcutName,
  overrides: Record<string, KeyboardShortcutOverride>,
): ShortcutDefinition | [ShortcutDefinition, ShortcutDefinition] | null => {
  const override = overrides[name];
  if (override) return override;
  const defaultDef: ShortcutEntry['default'] = KEYBOARD_SHORTCUTS[name].default;
  if (defaultDef === null) return null;
  if (isKeyboardShortcutDualVariant(defaultDef)) {
    return [defaultDef.native, defaultDef.browser];
  }
  return defaultDef;
};
