import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { ArtifactSharingAccessLevel } from './ArtifactSharingAccessLevel';
import { ArtifactLinkAccessLevelSelect } from './ArtifactLinkAccessLevelSelect';
import { CopyWithWebshareButton } from '../info/CopyWithWebshareButton';
import styled from 'styled-components';
import { appIdbStorageManager } from '../../utils/localDb/AppIdbStorageManager';
import { CollaborationManagerConnection } from '../../utils/collaboration/collaborationManager';
import { useObserveYArtifactUserAccess } from '../../utils/collaboration/useObserveYArtifactUserAccess';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import type { ArtifactAccessLevel } from '@prisma/client';
import { Box, Flex, Heading, Reset, TextField } from '@radix-ui/themes';
import { IoSearch } from '../AppIcons';
import { useDebounce } from '../../utils/useDebouncer';
import type { KnownUserDoc } from '../../utils/localDb/localDb';

const ShareLinkDisplay = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;

  a {
    word-wrap: anywhere;
  }

  span {
    white-space: nowrap;
  }
`;

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
}

export const ArtifactSharingManagement: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const searchTextRef = useRef(searchText);
  searchTextRef.current = searchText;
  const [searchResult, setSearchResult] = useState<KnownUserDoc>();
  const [knownUsers, setKnownUsers] = useState<KnownUserDoc[]>([]);
  const allSeenUsers = useRef<Map<string, KnownUserDoc>>(new Map());
  const [searching, setSearching] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const { userAccessYKV } = useObserveYArtifactUserAccess(
    props.connection.yjsDoc,
  );
  const { title, linkAccessLevel } = useObserveYArtifactMeta(
    props.connection.yjsDoc,
  );

  useEffect(() => {
    if (searchResult) {
      allSeenUsers.current.set(searchResult.id, {
        ...searchResult,
      });
    }
    for (const knownUser of knownUsers) {
      allSeenUsers.current.set(knownUser.id, {
        ...knownUser,
      });
    }
  }, [searchResult, knownUsers]);

  const getKnownUsers = async () => {
    await trpc.user.getKnownUsers
      .query()
      .then((result) => {
        setKnownUsers(result);
      })
      .catch(() => {
        // Do nothing, we don't care about errors here
      });
  };

  useEffect(() => {
    getKnownUsers();
  }, []);

  const debouncedSearchText = useDebounce(searchText, 200);

  useEffect(() => {
    if (!searchText.length || !searchText.includes('@')) {
      setSearchResult(undefined);
      setSearching(false);
      return;
    }

    setSearching(true);

    trpc.user.getByEmail
      .query({
        email: searchText,
      })
      .then(async (result) => {
        // This promise returned for an old keystroke and would be out of order
        if (searchText !== searchTextRef.current) return;

        const session = await appIdbStorageManager.getSession();
        if (session?.userId === result.id) {
          // Do not allow sharing with yourself
          setSearchResult(undefined);
          return;
        }

        setSearchResult(result);
      })
      .catch((error) => {
        // This promise returned for an old keystroke and would be out of order
        if (searchText !== searchTextRef.current) return;

        handleTRPCErrors(error, {
          400: () => {
            // Do nothing (expected if the user types an invalid email format)
          },
          412: () => {
            // Do nothing (expected if the user types an email for a user who does not exist in the system)
          },
        });
        setSearchResult(undefined);
      })
      .finally(() => {
        // This promise returned for an old keystroke and would be out of order
        if (searchText !== searchTextRef.current) return;

        setSearching(false);
      });
  }, [debouncedSearchText]);

  const onAccessLevelChanged = async (
    userId: string,
    accessLevel: 'noaccess' | 'readwrite' | 'readonly' | 'coowner',
  ) => {
    if (accessLevel === 'noaccess') {
      userAccessYKV.delete(userId);
    } else {
      userAccessYKV.set(userId, {
        accessLevel,
      });
    }
  };

  const linkAccessLevelChanged = (linkAccessLevel: ArtifactAccessLevel) => {
    props.connection.yjsDoc
      .getMap(ARTIFACT_META_KEY)
      .set('linkAccessLevel', linkAccessLevel);
  };

  const knownUsersNotSharedTo = knownUsers.filter(
    (el) => !userAccessYKV.has(el.id),
  );

  const shareUrl = `https://feynote.com/artifact/${props.artifactId}`;

  return (
    <>
      <Flex align="center">
        <Reset>
          <Heading as="h2" size="3">
            {t('artifactSharing.existing')}
          </Heading>
        </Reset>
        <InfoButton message={t('artifactSharing.existing.help')} />
      </Flex>
      {userAccessYKV.yarray.map(({ key, val }) => (
        <ArtifactSharingAccessLevel
          key={key}
          userName={
            allSeenUsers.current.get(key)?.name ||
            allSeenUsers.current.get(key)?.email ||
            key
          }
          accessLevel={val.accessLevel || 'noaccess'}
          onChange={(accessLevel) => onAccessLevelChanged(key, accessLevel)}
        />
      ))}
      {!userAccessYKV.yarray.length && (
        <div>{t('artifactSharing.noShares')}</div>
      )}
      &nbsp;
      {!!knownUsersNotSharedTo.length && (
        <>
          <Flex align="center">
            <Reset>
              <Heading as="h3" size="2">
                {t('artifactSharing.knownUsers')}
              </Heading>
            </Reset>
            <InfoButton message={t('artifactSharing.knownUsers.help')} />
          </Flex>
          {knownUsersNotSharedTo.map((knownUser) => (
            <ArtifactSharingAccessLevel
              key={knownUser.id}
              userName={knownUser.name || knownUser.email}
              accessLevel={
                userAccessYKV.get(knownUser.id)?.accessLevel || 'noaccess'
              }
              onChange={(accessLevel) =>
                onAccessLevelChanged(knownUser.id, accessLevel)
              }
            />
          ))}
        </>
      )}
      <Flex align="center">
        <Reset>
          <Heading as="h3" size="2">
            {t('artifactSharing.search')}
          </Heading>
        </Reset>
        <InfoButton message={t('artifactSharing.search.help')} />
      </Flex>
      <TextField.Root
        placeholder={t('artifactSharing.search.placeholder')}
        onChange={(event) => {
          setSearching(true);
          setSearchText(event.target.value);
        }}
      >
        <TextField.Slot>
          <IoSearch height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      {!searching && !!searchText.length && !!searchResult && (
        <ArtifactSharingAccessLevel
          userName={searchResult.name || searchResult.email}
          accessLevel={
            userAccessYKV.get(searchResult.id)?.accessLevel || 'noaccess'
          }
          onChange={(accessLevel) =>
            onAccessLevelChanged(searchResult.id, accessLevel)
          }
        />
      )}
      {!searching && !!searchText.length && !searchResult && (
        <Box p="2">{t('artifactSharing.search.noResult')}</Box>
      )}
      {searching && <Box p="2">{t('artifactSharing.search.searching')}</Box>}
      <br />
      <br />
      <Flex align="center">
        <Reset>
          <Heading as="h2" size="3">
            {t('artifactSharing.link')}
          </Heading>
        </Reset>
        <InfoButton message={t('artifactSharing.link.help')} />
      </Flex>
      <ArtifactLinkAccessLevelSelect
        artifactAccessLevel={linkAccessLevel || 'noaccess'}
        setArtifactAccessLevel={linkAccessLevelChanged}
      />
      {linkAccessLevel !== 'noaccess' && (
        <Box p="2">
          <ShareLinkDisplay>
            <a href={shareUrl} target="_blank" rel="noreferrer">
              {shareUrl}
            </a>
            <div>
              <CopyWithWebshareButton
                copyText={shareUrl}
                webshareTitle={title}
                webshareURL={shareUrl}
              />
            </div>
          </ShareLinkDisplay>
        </Box>
      )}
    </>
  );
};
