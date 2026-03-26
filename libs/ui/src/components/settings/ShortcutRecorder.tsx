import { useEffect, useRef, useState } from 'react';
import { Button, Flex, Text } from '@radix-ui/themes';
import styled from 'styled-components';
import {
  type ShortcutDefinition,
  getKeyboardShortcutDisplayString,
  findConflictingKeyboardShortcut,
  keyboardEventToShortcutDefinition,
} from '../../utils/keyboardShortcuts';
import type { KeyboardShortcutOverride } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';

const RecorderButton = styled(Button)`
  min-width: 120px;
`;

const RecordingIndicator = styled.div`
  padding: 4px 12px;
  border-radius: 4px;
  border: 2px dashed var(--accent-9);
  min-width: 120px;
  text-align: center;
  outline: none;
`;

interface Props {
  shortcutName: string;
  currentDisplay: string;
  overrides: Record<string, KeyboardShortcutOverride>;
  onRecord: (definition: ShortcutDefinition) => void;
  onCancel: () => void;
  recording: boolean;
  onStartRecording: () => void;
}

const MODIFIER_KEYS = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'NumLock',
  'ScrollLock',
]);

export const ShortcutRecorder: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [captured, setCaptured] = useState<ShortcutDefinition | null>(null);
  const recorderRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(props.onCancel);
  onCancelRef.current = props.onCancel;

  useEffect(() => {
    if (!props.recording) {
      setCaptured(null);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        setCaptured(null);
        onCancelRef.current();
        return;
      }

      if (MODIFIER_KEYS.has(event.key)) return;

      setCaptured(keyboardEventToShortcutDefinition(event));
    };

    window.addEventListener('keydown', handleKeyDown, true);
    recorderRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [props.recording]);

  if (!props.recording) {
    return (
      <RecorderButton variant="soft" size="1" onClick={props.onStartRecording}>
        {props.currentDisplay || t('settings.keyboardShortcuts.unbound')}
      </RecorderButton>
    );
  }

  if (captured) {
    const conflict = findConflictingKeyboardShortcut(
      captured,
      props.overrides,
      props.shortcutName,
    );
    const displayStr = getKeyboardShortcutDisplayString(captured);

    return (
      <Flex direction="column" gap="1" align="end">
        <Flex gap="2" align="center">
          <Text size="2" weight="bold">
            {displayStr}
          </Text>
          <Button
            variant="solid"
            size="1"
            onClick={() => {
              props.onRecord(captured);
              setCaptured(null);
            }}
          >
            {t('settings.keyboardShortcuts.confirm')}
          </Button>
          <Button
            variant="soft"
            color="gray"
            size="1"
            onClick={() => {
              setCaptured(null);
              props.onCancel();
            }}
          >
            {t('generic.cancel')}
          </Button>
        </Flex>
        {conflict && (
          <Text size="1" color="orange">
            {t('settings.keyboardShortcuts.conflict', {
              action: t(conflict.label),
            })}
          </Text>
        )}
      </Flex>
    );
  }

  return (
    <RecordingIndicator ref={recorderRef} tabIndex={-1}>
      <Text size="2" color="gray">
        {t('settings.keyboardShortcuts.record')}
      </Text>
    </RecordingIndicator>
  );
};
