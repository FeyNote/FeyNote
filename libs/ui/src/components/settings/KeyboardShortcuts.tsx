import { Box, Button, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PaneNav } from '../pane/PaneNav';
import {
  PaneContent,
  PaneContentContainer,
} from '../pane/PaneContentContainer';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';
import {
  type ShortcutCategory,
  type ShortcutDefinition,
  type ShortcutName,
  KEYBOARD_SHORTCUTS,
  getKeyboardShortcutEntryDisplayString,
} from '../../utils/keyboardShortcuts';
import { ShortcutRecorder } from './ShortcutRecorder';
import { useState } from 'react';
import { useAlertContext } from '../../context/alert/AlertContext';
import { RiRefreshLine } from '../AppIcons';

const ShortcutRow = styled(Flex)`
  padding: 6px 0;
  border-bottom: 1px solid var(--gray-a4);

  &:last-child {
    border-bottom: none;
  }
`;

const SectionContainer = styled(Box)`
  margin-bottom: 24px;
`;

const CATEGORY_I18N: Record<ShortcutCategory, string> = {
  global: 'settings.keyboardShortcuts.section.global',
  document: 'settings.keyboardShortcuts.section.document',
  textDocument: 'settings.keyboardShortcuts.section.textDocument',
};

const getShortcutsByCategory = (category: ShortcutCategory): ShortcutName[] =>
  (Object.keys(KEYBOARD_SHORTCUTS) as ShortcutName[]).filter(
    (name) => KEYBOARD_SHORTCUTS[name].category === category,
  );

export const KeyboardShortcuts: React.FC = () => {
  const { t } = useTranslation();
  const { getPreference, setPreference } = usePreferencesContext();
  const { showAlert } = useAlertContext();
  const [recordingId, setRecordingId] = useState<string | null>(null);

  const overrides = getPreference(PreferenceNames.KeyboardShortcutOverrides);

  const handleRecord = (name: string, definition: ShortcutDefinition) => {
    const newOverrides = { ...overrides, [name]: definition };
    setPreference(PreferenceNames.KeyboardShortcutOverrides, newOverrides);
    setRecordingId(null);
  };

  const handleReset = (name: string) => {
    const newOverrides = { ...overrides };
    delete newOverrides[name];
    setPreference(PreferenceNames.KeyboardShortcutOverrides, newOverrides);
  };

  const handleResetAll = () => {
    showAlert({
      title: t('settings.keyboardShortcuts.resetAll'),
      children: t('settings.keyboardShortcuts.resetAll.confirm'),
      actionButtons: [
        {
          title: t('generic.cancel'),
          props: { color: 'gray' },
        },
        {
          title: t('settings.keyboardShortcuts.resetAll'),
          props: {
            onClick: () => {
              setPreference(PreferenceNames.KeyboardShortcutOverrides, {});
            },
          },
        },
      ],
    });
  };

  const hasOverrides = Object.keys(overrides).length > 0;

  const renderShortcutRows = (shortcuts: ShortcutName[]) =>
    shortcuts.map((name) => {
      const entry = KEYBOARD_SHORTCUTS[name];
      const isCustomized = name in overrides;
      const displayString = getKeyboardShortcutEntryDisplayString(
        name,
        overrides,
      );

      if (entry.customizable) {
        return (
          <ShortcutRow key={name} justify="between" align="center">
            <Text size="2">{t(entry.label)}</Text>
            <Flex gap="2" align="center">
              <ShortcutRecorder
                shortcutName={name}
                currentDisplay={displayString}
                overrides={overrides}
                recording={recordingId === name}
                onStartRecording={() => setRecordingId(name)}
                onRecord={(def) => handleRecord(name, def)}
                onCancel={() => setRecordingId(null)}
              />
              {isCustomized && (
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="1"
                  onClick={() => handleReset(name)}
                  title={t('settings.keyboardShortcuts.reset')}
                >
                  <RiRefreshLine />
                </IconButton>
              )}
            </Flex>
          </ShortcutRow>
        );
      }

      return (
        <ShortcutRow key={name} justify="between" align="center">
          <Text size="2" color="gray">
            {t(entry.label)}
          </Text>
          <Text size="2" color="gray">
            {getKeyboardShortcutEntryDisplayString(name, {})}
          </Text>
        </ShortcutRow>
      );
    });

  const renderSection = (category: ShortcutCategory) => (
    <SectionContainer>
      <Heading size="3" mb="2">
        {t(CATEGORY_I18N[category])}
      </Heading>
      {renderShortcutRows(getShortcutsByCategory(category))}
    </SectionContainer>
  );

  return (
    <PaneContentContainer>
      <PaneNav title={t('settings.keyboardShortcuts.title')} />
      <PaneContent>
        <Text size="1" color="gray" as="p" mb="4">
          {t('settings.keyboardShortcuts.warning')}
        </Text>

        {hasOverrides && (
          <Flex justify="end" mb="4">
            <Button variant="soft" color="gray" onClick={handleResetAll}>
              {t('settings.keyboardShortcuts.resetAll')}
            </Button>
          </Flex>
        )}

        {renderSection('global')}

        <SectionContainer>
          <Heading size="3" mb="2">
            {t(CATEGORY_I18N.document)}
          </Heading>
          {renderShortcutRows(getShortcutsByCategory('document'))}

          <Heading size="2" mt="4" mb="2" color="gray">
            {t(CATEGORY_I18N.textDocument)}
          </Heading>
          {renderShortcutRows(getShortcutsByCategory('textDocument'))}
        </SectionContainer>
      </PaneContent>
    </PaneContentContainer>
  );
};
