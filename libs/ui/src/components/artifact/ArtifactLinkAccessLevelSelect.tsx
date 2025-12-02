import type { ArtifactAccessLevel } from '@prisma/client';
import { Avatar, Box, Flex, Select, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { CiUser } from '../AppIcons';
import { accessLevelI18n } from './ArtifactSharingAccessLevel';

interface Props {
  artifactAccessLevel: ArtifactAccessLevel;
  setArtifactAccessLevel: (accessLevel: ArtifactAccessLevel) => void;
}

export const ArtifactLinkAccessLevelSelect: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <Box p="2">
      <Flex justify="between" align="center">
        <Flex gap="3" align="center">
          <Avatar size="3" radius="full" fallback={<CiUser />} color="indigo" />
          <Box>
            <Text as="div" size="2" weight="bold">
              {t('artifactSharing.link.accessLevel')}
            </Text>
            <Text as="div" size="2" color="gray">
              {t(accessLevelI18n[props.artifactAccessLevel])}
            </Text>
          </Box>
        </Flex>
        <Select.Root
          value={props.artifactAccessLevel}
          onValueChange={(value) => {
            props.setArtifactAccessLevel(value as ArtifactAccessLevel);
          }}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              <Select.Item value="noaccess">
                {t(accessLevelI18n.noaccess)}
              </Select.Item>
              <Select.Item value="readonly">
                {t(accessLevelI18n.readonly)}
              </Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Flex>
    </Box>
  );
};
