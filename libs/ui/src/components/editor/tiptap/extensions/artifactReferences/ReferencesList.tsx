import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { MdHorizontalRule, MdOutlineShortText, MdSearch } from 'react-icons/md';
import { IoDocument } from 'react-icons/io5';
import { t } from 'i18next';
import { trpc } from '../../../../../utils/trpc';
import type { ArtifactDTO } from '@feynote/global-types';
import { capitalize } from '@feynote/shared-utils';
import { CalendarSelectDate } from '../../../../calendar/CalendarSelectDate';

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
    trpc.artifact.createArtifact
      .mutate({
        title,
        type: 'tiptap',
        theme: 'default',
      })
      .then((artifact) => {
        props.command({
          artifactId: artifact.id,
          artifactBlockId: undefined,
          artifactDate: undefined,
          referenceText: title,
        });
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
                  {item.artifactBlockId ? (
                    <MdOutlineShortText size={18} />
                  ) : (
                    <IoDocument size={18} />
                  )}
                </SuggestionListItemIcon>
                <SuggestionListItemText>
                  <SuggestionListItemTitle>
                    {item.referenceText}
                  </SuggestionListItemTitle>
                  <SuggestionListItemSubtitle>
                    {item.artifactBlockId
                      ? t('editor.referenceMenu.artifactBlock', {
                          title: item.artifact.title,
                        })
                      : t('editor.referenceMenu.artifact')}
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
