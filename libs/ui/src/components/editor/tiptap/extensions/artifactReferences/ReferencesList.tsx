import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {
  MdDraw,
  MdHorizontalRule,
  MdOutlineShortText,
  MdSearch,
} from 'react-icons/md';
import { IoCalendar, IoDocument } from 'react-icons/io5';
import { t } from 'i18next';
import type { ArtifactDTO } from '@feynote/global-types';
import {
  ArtifactReferenceExistingArtifactSharingMode,
  ArtifactReferenceNewArtifactSharingMode,
  assert,
  capitalize,
  getArtifactAccessLevel,
  getMetaFromYArtifact,
  getUserAccessFromYArtifact,
  PreferenceNames,
  updateYArtifactMeta,
} from '@feynote/shared-utils';
import { CalendarSelectDate } from '../../../../calendar/CalendarSelectDate';
import { useHandleTRPCErrors } from '../../../../../utils/useHandleTRPCErrors';
import { createArtifact } from '../../../../../utils/createArtifact';
import * as Sentry from '@sentry/react';
import { useSessionContext } from '../../../../../context/session/SessionContext';
import type { Doc as YDoc } from 'yjs';
import { useIonAlert, type AlertButton } from '@ionic/react';
import { usePreferencesContext } from '../../../../../context/preferences/PreferencesContext';
import { getSelfManagedCollaborationConnection } from '../../../../../utils/collaboration/collaborationManager';
import { appIdbStorageManager } from '../../../../../utils/AppIdbStorageManager';
import type { ArtifactAccessLevel } from '@prisma/client';

const SuggestionListContainer = styled.div`
  width: min(350px, 100vw);
  max-height: 450px;
  background-color: var(--ion-card-background, #ffffff);
  border-radius: 4px;
  box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.4);
  color: var(--ion-text-color, #000000);
  overflow-y: auto;
  padding: 4px;
`;

const SuggestionListItem = styled.button<{
  $selected: boolean;
}>`
  display: grid;
  grid-template-columns: 50px auto;
  align-items: center;
  text-align: left;

  border-radius: 4px;

  color: var(--ion-text-color, #000000);
  background-color: var(--ion-card-background, #ffffff);
  ${(props) =>
    props.$selected
      ? `background-color: var(--ion-background-color, #dddddd);`
      : ``}
  width: 100%;
  min-height: 52px;

  padding-top: 6px;
  padding-bottom: 6px;
`;

const SuggestionListItemIcon = styled.div`
  text-align: center;
  background-color: var(--ion-background-color, #ffffff);
  height: 34px;
  width: 34px;
  border-radius: 6px;
  margin-right: 4px;

  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
`;

const SuggestionListItemText = styled.div``;

const SuggestionListItemTitle = styled.div`
  margin-bottom: 4px;
`;

const SuggestionListItemSubtitle = styled.div`
  color: rgba(var(--ion-text-color-rgb, rgb(0, 0, 0)), 0.8);
  font-size: 11px;
`;

export interface ReferenceItem {
  artifactId: string;
  artifactBlockId: string | undefined;
  referenceText: string;
  artifact: ArtifactDTO;
}

interface Props {
  yDoc: YDoc;
  artifactId: string;
  items: ReferenceItem[];
  query: string;
  command: (args: {
    artifactId: string;
    artifactBlockId: string | undefined;
    artifactDate: string | undefined;
    referenceText: string;
  }) => void;
  searching: boolean;
}

export const ReferencesList = forwardRef<unknown, Props>((props, ref) => {
  const [domNonce] = useState(Math.random().toString());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showUi, setShowUi] = useState(true);
  const [creatingItem, setCreatingItem] = useState(false);
  const [showCalendarInput, setShowCalendarInput] = useState(false);
  const selectedItemInfoRef = useRef<
    ReferenceItem & {
      artifactDate?: string | undefined;
    }
  >(undefined);
  const { getPreference, setPreference } = usePreferencesContext();
  const [presentAlert] = useIonAlert();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const sessionContext = useSessionContext(true);

  const showCreateButton =
    props.items.length !== 0 && !!props.query.trim().length;
  const itemCount = props.items.length + (showCreateButton ? 1 : 0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  const upHandler = () => {
    const newIdx = (selectedIndex + itemCount - 1) % itemCount;
    setSelectedIndex(newIdx);
    document
      .getElementById(`reference-item-${domNonce}-${newIdx}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
  };

  const downHandler = () => {
    const newIdx = (selectedIndex + 1) % itemCount;
    setSelectedIndex(newIdx);
    document
      .getElementById(`reference-item-${domNonce}-${newIdx}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  const submitCreateItem = () => {
    if (creatingItem) return;
    setCreatingItem(true);

    const artifactMeta = getMetaFromYArtifact(props.yDoc);
    const userAccess = getUserAccessFromYArtifact(props.yDoc);

    const _createItem = (shareWithCurrent: boolean) => {
      const title = capitalize(props.query);

      createArtifact({
        artifact: {
          title,
          userAccess: shareWithCurrent ? userAccess.map : undefined,
          linkAccessLevel: shareWithCurrent
            ? artifactMeta.linkAccessLevel
            : undefined,
        },
      })
        .then(({ id }) => {
          props.command({
            artifactId: id,
            artifactBlockId: undefined,
            artifactDate: undefined,
            referenceText: title,
          });
        })
        .catch((e) => {
          handleTRPCErrors(e);
        });
    };

    setShowUi(false);

    const defaultSharingMode = getPreference(
      PreferenceNames.ArtifactReferenceNewArtifactSharingMode,
    );
    const hasUserAccessSet = userAccess.yarray
      .toArray()
      .filter((el) => el.val.accessLevel !== 'noaccess');
    const hasLinkAccessSet = artifactMeta.linkAccessLevel !== 'noaccess';
    const isShared = hasUserAccessSet || hasLinkAccessSet;

    if (
      isShared &&
      defaultSharingMode === ArtifactReferenceNewArtifactSharingMode.Prompt
    ) {
      presentAlert({
        header: t('editor.referenceMenu.newArtifactShareWithCurrent.header'),
        message: t('editor.referenceMenu.newArtifactShareWithCurrent.message'),
        buttons: [
          {
            text: t('editor.referenceMenu.newArtifactShareWithCurrent.never'),
            role: 'never',
          },
          {
            text: t('editor.referenceMenu.newArtifactShareWithCurrent.always'),
            role: 'always',
          },
          {
            text: t('editor.referenceMenu.newArtifactShareWithCurrent.no'),
            role: 'no',
          },
          {
            text: t('editor.referenceMenu.newArtifactShareWithCurrent.yes'),
            role: 'yes',
          },
        ],
        onDidDismiss: (event) => {
          switch (event.detail.role) {
            case 'never': {
              setPreference(
                PreferenceNames.ArtifactReferenceNewArtifactSharingMode,
                ArtifactReferenceNewArtifactSharingMode.Never,
              );
              _createItem(false);
              break;
            }
            case 'always': {
              setPreference(
                PreferenceNames.ArtifactReferenceNewArtifactSharingMode,
                ArtifactReferenceNewArtifactSharingMode.Always,
              );
              _createItem(true);
              break;
            }
            case 'yes': {
              _createItem(true);
              break;
            }
            case 'no': {
              _createItem(false);
              break;
            }
          }
        },
      });
    } else if (
      isShared &&
      defaultSharingMode === ArtifactReferenceNewArtifactSharingMode.Always
    ) {
      _createItem(true);
    } else {
      _createItem(false);
    }
  };

  const submitLinkExistingItem = async () => {
    if (creatingItem) return;
    setCreatingItem(true);

    const item = selectedItemInfoRef.current;
    if (!item) {
      throw new Error(
        'submitLinkExistingItem was called without a selectedItem',
      );
    }

    setShowUi(false);

    const _submit = () => {
      props.command({
        artifactId: item.artifactId,
        artifactBlockId: item.artifactBlockId,
        artifactDate: item.artifactDate,
        referenceText: item.referenceText,
      });
    };

    const enableSharingSyncPrompt =
      getPreference(
        PreferenceNames.ArtifactReferenceExistingArtifactSharingMode,
      ) === ArtifactReferenceExistingArtifactSharingMode.Prompt;
    const session = await appIdbStorageManager.getSession();
    if (session && enableSharingSyncPrompt) {
      const sourceMeta = getMetaFromYArtifact(props.yDoc);
      const sourceUserAccessList = getUserAccessFromYArtifact(props.yDoc);
      const targetCollabConnectionInfo =
        await getSelfManagedCollaborationConnection(
          `artifact:${item.artifactId}`,
        );
      const currentUserAccessLevelToSource = getArtifactAccessLevel(
        props.yDoc,
        session.userId,
      );
      const currentUserAccessLevelToTarget = getArtifactAccessLevel(
        targetCollabConnectionInfo.connection.yjsDoc,
        session.userId,
      );

      if (currentUserAccessLevelToTarget !== 'coowner') {
        // We can't change sharing permissions if you don't own the _target_ artifact in question. Only owners can change sharing permissions.
        targetCollabConnectionInfo.release();
        _submit();
        return;
      }

      const targetMeta = getMetaFromYArtifact(
        targetCollabConnectionInfo.connection.yjsDoc,
      );
      const targetUserAccessList = getUserAccessFromYArtifact(
        targetCollabConnectionInfo.connection.yjsDoc,
      );

      const linkAccessLevelsRanked: ArtifactAccessLevel[] = [
        'noaccess',
        'readonly',
        'readwrite',
        'coowner',
      ];

      const propagateHigherLinkAccessLevel = () => {
        const sourceIdx = linkAccessLevelsRanked.indexOf(
          sourceMeta.linkAccessLevel,
        );
        const targetIdx = linkAccessLevelsRanked.indexOf(
          targetMeta.linkAccessLevel,
        );

        if (
          sourceIdx > targetIdx &&
          currentUserAccessLevelToTarget === 'coowner'
        ) {
          updateYArtifactMeta(targetCollabConnectionInfo.connection.yjsDoc, {
            linkAccessLevel: linkAccessLevelsRanked[sourceIdx],
          });
        }
        if (
          targetIdx > sourceIdx &&
          currentUserAccessLevelToSource === 'coowner'
        ) {
          updateYArtifactMeta(props.yDoc, {
            linkAccessLevel: linkAccessLevelsRanked[targetIdx],
          });
        }
      };

      const propagateSourceUsersToTarget = () => {
        if (currentUserAccessLevelToTarget !== 'coowner') return;

        for (const sourceUserAccessEntry of sourceUserAccessList.yarray) {
          const targetUserAccessEntry = targetUserAccessList.get(
            sourceUserAccessEntry.key,
          );
          if (
            targetUserAccessEntry?.accessLevel !==
            sourceUserAccessEntry.val.accessLevel
          ) {
            targetUserAccessList.set(
              sourceUserAccessEntry.key,
              sourceUserAccessEntry.val,
            );
          }
        }
      };

      const propagateTargetUsersToSource = () => {
        if (currentUserAccessLevelToSource !== 'coowner') return;

        for (const targetUserAccessEntry of targetUserAccessList.yarray) {
          const sourceUserAccessEntry = sourceUserAccessList.get(
            targetUserAccessEntry.key,
          );
          if (
            sourceUserAccessEntry?.accessLevel !==
            targetUserAccessEntry.val.accessLevel
          ) {
            sourceUserAccessList.set(
              targetUserAccessEntry.key,
              targetUserAccessEntry.val,
            );
          }
        }
      };

      try {
        assert(
          linkAccessLevelsRanked.indexOf(sourceMeta.linkAccessLevel) > -1,
          'Source linkAccessLevel must be present and valid',
        );
        assert(
          linkAccessLevelsRanked.indexOf(targetMeta.linkAccessLevel) > -1,
          'Target linkAccessLevel must be present and valid',
        );
      } catch (e) {
        targetCollabConnectionInfo.release();
        throw e;
      }

      /**
       * We only propagate a linkAccessLevel diff if the user has coowner access to the higher of the two asset's linkAccessLevels, since we never want to propagate a _lower_ sharing level via this mechanism.
       */
      let linkAccessLevelDiff = false;
      if (
        linkAccessLevelsRanked.indexOf(sourceMeta.linkAccessLevel) >
          linkAccessLevelsRanked.indexOf(targetMeta.linkAccessLevel) &&
        currentUserAccessLevelToTarget === 'coowner'
      ) {
        linkAccessLevelDiff = true;
      }
      if (
        linkAccessLevelsRanked.indexOf(sourceMeta.linkAccessLevel) <
          linkAccessLevelsRanked.indexOf(targetMeta.linkAccessLevel) &&
        currentUserAccessLevelToSource === 'coowner'
      ) {
        linkAccessLevelDiff = true;
      }

      /**
       * We can only add users to the target if we're coowner of the target
       */
      const usersMissingFromTarget: string[] = [];
      if (currentUserAccessLevelToTarget === 'coowner') {
        for (const sourceUserAccessEntry of sourceUserAccessList.yarray) {
          const targetUserAccessEntry = targetUserAccessList.get(
            sourceUserAccessEntry.key,
          );
          if (
            targetUserAccessEntry?.accessLevel !==
            sourceUserAccessEntry.val.accessLevel
          ) {
            usersMissingFromTarget.push(sourceUserAccessEntry.key);
          }
        }
      }

      /**
       * We can only add users to the source if we're coowner of the source
       */
      const usersMissingFromSource: string[] = [];
      if (currentUserAccessLevelToSource === 'coowner') {
        for (const targetUserAccessEntry of targetUserAccessList.yarray) {
          const sourceUserAccessEntry = sourceUserAccessList.get(
            targetUserAccessEntry.key,
          );
          if (
            sourceUserAccessEntry?.accessLevel !==
            targetUserAccessEntry.val.accessLevel
          ) {
            usersMissingFromSource.push(targetUserAccessEntry.key);
          }
        }
      }

      const numberOfDiffs = [
        !!linkAccessLevelDiff,
        !!usersMissingFromTarget.length,
        !!usersMissingFromSource.length,
      ].filter((el) => el);
      if (!numberOfDiffs.length) {
        // There is no diff, so nothing to prompt the user about
        targetCollabConnectionInfo.release();
        _submit();
        return;
      }

      const header = t(
        'editor.referenceMenu.existingArtifactShareWithCurrent.header',
      );
      const subHeader = t(
        'editor.referenceMenu.existingArtifactShareWithCurrent.subHeader',
      );
      let message = '';
      if (linkAccessLevelDiff)
        message += t(
          'editor.referenceMenu.existingArtifactShareWithCurrent.message.diff.linkAccessLevel',
        );
      if (usersMissingFromTarget.length)
        message += t(
          'editor.referenceMenu.existingArtifactShareWithCurrent.message.diff.usersMissingFromTarget',
        );
      if (usersMissingFromSource.length)
        message += t(
          'editor.referenceMenu.existingArtifactShareWithCurrent.message.diff.usersMissingFromSource',
        );

      const buttons: AlertButton[] = [];

      if (linkAccessLevelDiff) {
        buttons.push({
          text: t(
            'editor.referenceMenu.existingArtifactShareWithCurrent.actions.diff.sync.linkAccessLevel',
          ),
          role: 'linkAccessLevel',
        });
      }

      if (usersMissingFromTarget.length) {
        buttons.push({
          text: t(
            'editor.referenceMenu.existingArtifactShareWithCurrent.actions.diff.sync.usersMissingFromTarget',
          ),
          role: 'usersMissingFromTarget',
        });
      }

      if (usersMissingFromSource.length) {
        buttons.push({
          text: t(
            'editor.referenceMenu.existingArtifactShareWithCurrent.actions.diff.sync.usersMissingFromSource',
          ),
          role: 'usersMissingFromSource',
        });
      }

      if (numberOfDiffs.length > 1) {
        buttons.push({
          text: t(
            'editor.referenceMenu.existingArtifactShareWithCurrent.actions.diff.syncAll',
          ),
          role: 'all',
        });
      }

      buttons.push({
        text: t(
          'editor.referenceMenu.existingArtifactShareWithCurrent.actions.diff.noSync',
        ),
        role: 'none',
      });

      presentAlert({
        header,
        subHeader,
        message,
        buttons,
        onDidDismiss: async (event) => {
          switch (event.detail.role) {
            case 'none': {
              _submit();
              break;
            }
            case 'all': {
              propagateHigherLinkAccessLevel();
              propagateSourceUsersToTarget();
              propagateTargetUsersToSource();
              _submit();
              break;
            }
            case 'linkAccessLevel': {
              propagateHigherLinkAccessLevel();
              _submit();
              break;
            }
            case 'usersMissingFromTarget': {
              propagateSourceUsersToTarget();
              _submit();
              break;
            }
            case 'usersMissingFromSource': {
              propagateTargetUsersToSource();
              _submit();
              break;
            }
          }
          targetCollabConnectionInfo.release();
        },
      });
      return;
    }

    _submit();
  };

  const selectItem = async (index: number) => {
    if (!props.items.length) {
      submitCreateItem();
      return;
    }

    const item = props.items.at(index);
    if (!item) {
      if (showCreateButton && index === props.items.length) {
        submitCreateItem();
      }
      return;
    }

    selectedItemInfoRef.current = item;
    if (item.artifact.type === 'calendar') {
      setCreatingItem(true);
      setShowCalendarInput(true);

      return;
    }

    submitLinkExistingItem();
  };

  const onCalendarSubmit = (date: string) => {
    if (!selectedItemInfoRef.current) return;

    selectedItemInfoRef.current = {
      ...selectedItemInfoRef.current,
      artifactDate: date,
    };
    submitLinkExistingItem();
  };

  if (props.searching) {
    return (
      <SuggestionListContainer>
        <SuggestionListItem $selected={false}>
          <SuggestionListItemIcon>
            <MdSearch size={18} />
          </SuggestionListItemIcon>
          <SuggestionListItemText>
            <SuggestionListItemTitle>
              {t('editor.referenceMenu.searching.title')}
            </SuggestionListItemTitle>
            <SuggestionListItemSubtitle>
              {t('editor.referenceMenu.searching.subtitle')}
            </SuggestionListItemSubtitle>
          </SuggestionListItemText>
        </SuggestionListItem>
      </SuggestionListContainer>
    );
  }

  const referenceItemSubtitleI18n = (item: ReferenceItem) => {
    const x =
      item.artifact.userId === sessionContext?.session.userId
        ? 'personal'
        : 'shared';
    const i18nVals = {
      block: {
        personal: 'editor.referenceMenu.artifactBlock',
        shared: 'editor.referenceMenu.artifactBlock.shared',
      },
      calendar: {
        personal: 'editor.referenceMenu.artifact.calendar',
        shared: 'editor.referenceMenu.artifact.calendar.shared',
      },
      tldraw: {
        personal: 'editor.referenceMenu.artifact.tldraw',
        shared: 'editor.referenceMenu.artifact.tldraw.shared',
      },
      tiptap: {
        personal: 'editor.referenceMenu.artifact.tiptap',
        shared: 'editor.referenceMenu.artifact.tiptap.shared',
      },
      genericArtifact: {
        personal: 'editor.referenceMenu.artifact',
        shared: 'editor.referenceMenu.artifact.shared',
      },
    };

    if (item.artifactBlockId) {
      return t(i18nVals.block[x], {
        title: item.artifact.title,
        userName: item.artifact.user.name,
      });
    }

    switch (item.artifact.type) {
      case 'calendar': {
        return t(i18nVals.calendar[x], {
          userName: item.artifact.user.name,
        });
      }
      case 'tldraw': {
        return t(i18nVals.tldraw[x], {
          userName: item.artifact.user.name,
        });
      }
      case 'tiptap': {
        return t(i18nVals.tiptap[x], {
          userName: item.artifact.user.name,
        });
      }
      default: {
        Sentry.captureMessage(`Unknown artifact type: ${item.artifact.type}`);
        return t(i18nVals.genericArtifact[x], {
          userName: item.artifact.user.name,
        });
      }
    }
  };

  const referenceItemIcon = (item: ReferenceItem) => {
    if (item.artifactBlockId) {
      return <MdOutlineShortText size={18} />;
    }

    switch (item.artifact.type) {
      case 'calendar': {
        return <IoCalendar size={18} />;
      }
      case 'tldraw': {
        return <MdDraw size={18} />;
      }
      case 'tiptap': {
        return <IoDocument size={18} />;
      }
      default: {
        Sentry.captureMessage(`Unknown artifact type: ${item.artifact.type}`);
        return <IoDocument size={18} />;
      }
    }
  };

  if (!showUi) return;

  return (
    <SuggestionListContainer>
      {!showCalendarInput && (
        <div>
          {props.items.map((item, index) => {
            return (
              <SuggestionListItem
                id={`reference-item-${domNonce}-${index}`}
                // We use onMouseMove to prevent the item from being selected when the mouse just happens to be over the element when the suggestion menu opens
                onMouseMove={() => setSelectedIndex(index)}
                $selected={index === selectedIndex}
                key={item.artifactId + item.artifactBlockId}
                onClick={() => selectItem(index)}
              >
                <SuggestionListItemIcon>
                  {referenceItemIcon(item)}
                </SuggestionListItemIcon>
                <SuggestionListItemText>
                  <SuggestionListItemTitle>
                    {item.referenceText}
                  </SuggestionListItemTitle>
                  <SuggestionListItemSubtitle>
                    {referenceItemSubtitleI18n(item)}
                  </SuggestionListItemSubtitle>
                </SuggestionListItemText>
              </SuggestionListItem>
            );
          })}
          {props.items.length === 0 && (
            <SuggestionListItem
              id={`reference-item-${domNonce}-0`}
              onMouseMove={() => setSelectedIndex(0)}
              $selected={selectedIndex === 0}
              onClick={() => submitCreateItem()}
            >
              <SuggestionListItemIcon>
                <MdHorizontalRule size={18} />
              </SuggestionListItemIcon>
              <SuggestionListItemText>
                <SuggestionListItemTitle>
                  {t('editor.referenceMenu.noItems.title', {
                    title: props.query,
                  })}
                </SuggestionListItemTitle>
                <SuggestionListItemSubtitle>
                  {t('editor.referenceMenu.noItems.subtitle')}
                </SuggestionListItemSubtitle>
              </SuggestionListItemText>
            </SuggestionListItem>
          )}
          {showCreateButton && (
            <SuggestionListItem
              id={`reference-item-${domNonce}-${props.items.length}`}
              onMouseMove={() => setSelectedIndex(props.items.length)}
              $selected={selectedIndex === props.items.length}
              onClick={() => submitCreateItem()}
            >
              <SuggestionListItemIcon>
                <MdHorizontalRule size={18} />
              </SuggestionListItemIcon>
              <SuggestionListItemText>
                <SuggestionListItemTitle>
                  {t('editor.referenceMenu.create.title', {
                    title: props.query,
                  })}
                </SuggestionListItemTitle>
                <SuggestionListItemSubtitle>
                  {t('editor.referenceMenu.create.subtitle')}
                </SuggestionListItemSubtitle>
              </SuggestionListItemText>
            </SuggestionListItem>
          )}
        </div>
      )}
      {showCalendarInput && selectedItemInfoRef.current && (
        <CalendarSelectDate
          artifactId={selectedItemInfoRef.current.artifactId}
          artifact={selectedItemInfoRef.current.artifact}
          onSubmit={onCalendarSubmit}
        />
      )}
    </SuggestionListContainer>
  );
});
