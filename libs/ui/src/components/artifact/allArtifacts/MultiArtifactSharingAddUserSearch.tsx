import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, TextField, Text } from '@radix-ui/themes';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { useHandleTRPCErrors } from '../../../utils/useHandleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { appIdbStorageManager } from '../../../utils/localDb/AppIdbStorageManager';
import type { KnownUserDoc } from '../../../utils/localDb/localDb';
import styled from 'styled-components';

const SectionHeader = styled.h2`
  font-size: 1rem;
`;

interface Props {
  alreadyPresentUserIds: Set<string>;
  onAddUser: (user: { id: string; name: string; email: string }) => void;
}

export const MultiArtifactSharingAddUserSearch: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<KnownUserDoc>();
  const [knownUsers, setKnownUsers] = useState<KnownUserDoc[]>([]);
  const allSeenUsers = useRef<Map<string, KnownUserDoc>>(new Map());
  const [searching, setSearching] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();

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
        const session = await appIdbStorageManager.getSession();
        if (session?.userId === result.id) {
          // Do not allow sharing with yourself
          setSearchResult(undefined);
          return;
        }

        setSearchResult(result);
      })
      .catch((error) => {
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
        setSearching(false);
      });
  }, [searchText]);

  return (
    <>
      <SectionHeader>{t('multiArtifactSharing.addUser')}</SectionHeader>
      <TextField.Root
        placeholder={t('artifactSharing.search.placeholder')}
        value={searchText}
        type="search"
        onChange={(event) => {
          setSearchText(event.target.value);
        }}
      >
        <TextField.Slot>
          <GiMagnifyingGlass height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      {searchResult ? (
        <Box
          maxWidth="350px"
          onClick={() => {
            props.onAddUser(searchResult);
            setSearchText('');
          }}
        >
          <Card asChild>
            <button>
              <Text as="div" size="2" weight="bold">
                {searchResult.email}
              </Text>
              <Text as="div" color="gray" size="2">
                {props.alreadyPresentUserIds.has(searchResult.id)
                  ? t('multiArtifactSharing.addUser.alreadyAdded')
                  : t('multiArtifactSharing.addUser.clickToAdd')}
              </Text>
            </button>
          </Card>
        </Box>
      ) : (
        <div>
          {!searching && !!searchText.length && !searchResult && (
            <div>{t('artifactSharing.search.noResult')}</div>
          )}
          {searching && <div>{t('artifactSharing.search.searching')}</div>}
        </div>
      )}
    </>
  );
};
