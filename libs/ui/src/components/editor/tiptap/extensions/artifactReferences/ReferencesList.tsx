import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
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
import { capitalize } from '@feynote/shared-utils';
import { CalendarSelectDate } from '../../../../calendar/CalendarSelectDate';
import { useHandleTRPCErrors } from '../../../../../utils/useHandleTRPCErrors';
import { createArtifact } from '../../../../../utils/createArtifact';
import * as Sentry from '@sentry/react';
import { SessionContext } from '../../../../../context/session/SessionContext';

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
  const [creatingItem, setCreatingItem] = useState(false);
  const [calendarSelectInfo, setCalendarSelectInfo] = useState<ReferenceItem>();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { session } = useContext(SessionContext);

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

  const createItem = () => {
    if (creatingItem) return;

    setCreatingItem(true);

    const title = capitalize(props.query);

    createArtifact({
      title,
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

  const selectItem = (index: number) => {
    if (!props.items.length) {
      createItem();
      return;
    }

    const item = props.items.at(index);
    if (!item) {
      if (showCreateButton && index === props.items.length) {
        createItem();
      }
      return;
    }

    if (item.artifact.type === 'calendar') {
      setCreatingItem(true);
      setCalendarSelectInfo(item);

      return;
    }

    props.command({
      artifactId: item.artifactId,
      artifactBlockId: item.artifactBlockId,
      artifactDate: undefined,
      referenceText: item.referenceText,
    });
  };

  const onCalendarSubmit = (date: string) => {
    if (!calendarSelectInfo) return;

    props.command({
      artifactId: calendarSelectInfo.artifactId,
      artifactBlockId: undefined,
      artifactDate: date,
      referenceText: calendarSelectInfo.referenceText,
    });
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
    const x = item.artifact.userId === session?.userId ? 'personal' : 'shared';
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

  return (
    <SuggestionListContainer>
      {!calendarSelectInfo && (
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
              onClick={() => createItem()}
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
              onClick={() => createItem()}
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
      {calendarSelectInfo && (
        <CalendarSelectDate
          artifactId={calendarSelectInfo.artifactId}
          artifact={calendarSelectInfo.artifact}
          onSubmit={onCalendarSubmit}
        />
      )}
    </SuggestionListContainer>
  );
});
