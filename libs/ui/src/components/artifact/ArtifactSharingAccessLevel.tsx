import type { ArtifactAccessLevel } from '@prisma/client';
import { Avatar, Box, Flex, Select, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

export const accessLevelI18n = {
  noaccess: 'artifactSharing.noaccess',
  readwrite: 'artifactSharing.readwrite',
  readonly: 'artifactSharing.readonly',
  coowner: 'artifactSharing.readonly',
} satisfies Record<ArtifactAccessLevel, string>;

interface ArtifactSharingAccessLevelSelectProps {
  accessLevel: 'noaccess' | 'readwrite' | 'readonly' | 'coowner';
  onChange: (level: 'noaccess' | 'readwrite' | 'readonly' | 'coowner') => void;
}

export const ArtifactSharingAccessLevelSelect: React.FC<
  ArtifactSharingAccessLevelSelectProps
> = (props) => {
  const { t } = useTranslation();

  return (
    <Select.Root
      value={props.accessLevel}
      onValueChange={(value) => {
        props.onChange(value as ArtifactAccessLevel);
      }}
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          <Select.Item value="noaccess">
            {t(accessLevelI18n.noaccess)}
          </Select.Item>
          <Select.Item value="readwrite">
            {t(accessLevelI18n.readwrite)}
          </Select.Item>
          <Select.Item value="readonly">
            {t(accessLevelI18n.readonly)}
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};

interface Props {
  userName: string;
  accessLevel: 'noaccess' | 'readwrite' | 'readonly' | 'coowner';
  onChange: (level: 'noaccess' | 'readwrite' | 'readonly' | 'coowner') => void;
}

export const ArtifactSharingAccessLevel: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <Box p="2">
      <Flex justify="between" align="center">
        <Flex gap="3" align="center">
          <Avatar
            size="3"
            radius="full"
            fallback={props.userName.substring(0, 1)}
            color="indigo"
          />
          <Box>
            <Text as="div" size="2" weight="bold">
              {props.userName}
            </Text>
            <Text as="div" size="2" color="gray">
              {t(accessLevelI18n[props.accessLevel])}
            </Text>
          </Box>
        </Flex>
        <ArtifactSharingAccessLevelSelect
          accessLevel={props.accessLevel}
          onChange={props.onChange}
        />
      </Flex>
    </Box>
  );
};
