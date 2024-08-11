import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import styled from 'styled-components';
import { MdHorizontalRule } from 'react-icons/md';
import { t } from 'i18next';
import { trpc } from '../../../../../../utils/trpc';
import { EventContext } from '../../../../../context/events/EventContext';
import { EventName } from '../../../../../context/events/EventName';
import type { ArtifactDTO } from '@feynote/prisma/types';
import { capitalize } from '@feynote/shared-utils';

const SuggestionListContainer = styled.div`
  width: min(350px, 100vw);
  max-height: 450px;
  background-color: var(--ion-card-background);
  border-radius: 4px;
  box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.4);
  color: var(--ion-text-color);
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

  color: var(--ion-text-color);
  background-color: var(--ion-card-background);
  ${(props) =>
    props.$selected ? `background-color: var(--ion-background-color);` : ``}
  width: 100%;
  min-height: 52px;

  padding-top: 6px;
  padding-bottom: 6px;

  &:hover {
    background-color: var(--ion-background-color);
  }
`;

const SuggestionListItemIcon = styled.div`
  text-align: center;
  background-color: var(--ion-background-color);
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
  color: rgba(var(--ion-text-color-rgb), 0.8);
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
  command: (...args: any) => void;
}

export const ReferencesList = forwardRef<unknown, Props>((props, ref) => {
  const { eventManager } = useContext(EventContext);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [creatingItem, setCreatingItem] = useState(false);

  // We always add 1 to the number of items since there's a "create" button
  const itemCount = props.items.length + 1;

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
    setSelectedIndex((selectedIndex + itemCount - 1) % itemCount);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % itemCount);
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
        isPinned: false,
        isTemplate: false,
        text: '',
        json: {},
        rootTemplateId: null,
        artifactTemplateId: null,
      })
      .then((artifact) => {
        props.command({
          artifactId: artifact.id,
          artifactBlockId: undefined,
          referenceText: title,
        });

        eventManager.broadcast([EventName.ArtifactCreated]);
      });
  };

  const selectItem = (index: number) => {
    if (!props.items.length) {
      createItem();
      return;
    }

    const item = props.items[index];

    console.log('type is', item.artifact.type);

    if (item) {
      props.command({
        artifactId: item.artifactId,
        artifactBlockId: item.artifactBlockId,
        referenceText: item.referenceText,
      });
    }
  };

  return (
    <SuggestionListContainer>
      {props.items.map((item, index) => {
        return (
          <SuggestionListItem
            $selected={index === selectedIndex}
            key={item.artifactId + item.artifactBlockId}
            onClick={() => selectItem(index)}
          >
            <SuggestionListItemIcon>
              <MdHorizontalRule size={18} />
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
      {props.items.length !== 0 && props.query.trim().length && (
        <SuggestionListItem
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
    </SuggestionListContainer>
  );
});
