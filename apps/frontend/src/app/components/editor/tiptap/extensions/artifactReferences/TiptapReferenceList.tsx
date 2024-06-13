import { Component } from 'react';
import styled from 'styled-components';
import { MdHorizontalRule } from 'react-icons/md';
import { t } from 'i18next';

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
  artifact: any;
}

interface Props {
  items: ReferenceItem[];
  command: (...args: any) => void;
}

interface State {
  selectedIndex: number;
}

export class TiptapReferenceList extends Component<Props, State> {
  state = {
    selectedIndex: 0,
  };

  componentDidUpdate(oldProps: Props) {
    if (this.props.items !== oldProps.items) {
      this.setState({
        selectedIndex: 0,
      });
    }
  }

  onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      this.enterHandler();
      return true;
    }

    return false;
  }

  upHandler() {
    this.setState({
      selectedIndex:
        (this.state.selectedIndex + this.props.items.length - 1) %
        this.props.items.length,
    });
  }

  downHandler() {
    this.setState({
      selectedIndex: (this.state.selectedIndex + 1) % this.props.items.length,
    });
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex);
  }

  selectItem(index: number) {
    if (!this.props.items.length) return;

    const item = this.props.items[index];

    if (item) {
      this.props.command({
        artifactId: item.artifactId,
        artifactBlockId: item.artifactBlockId,
        referenceText: item.referenceText,
      });
    }
  }

  render() {
    const { items } = this.props;
    return (
      <SuggestionListContainer>
        {items.map((item, index) => {
          return (
            <SuggestionListItem
              $selected={index === this.state.selectedIndex}
              key={index}
              onClick={() => this.selectItem(index)}
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
        {items.length === 0 && (
          <SuggestionListItem
            $selected={this.state.selectedIndex === 0}
            key={0}
          >
            <SuggestionListItemIcon>
              <MdHorizontalRule size={18} />
            </SuggestionListItemIcon>
            <SuggestionListItemText>
              <SuggestionListItemTitle>
                {t('editor.referenceMenu.noItems.title')}
              </SuggestionListItemTitle>
              <SuggestionListItemSubtitle>
                {t('editor.referenceMenu.noItems.subtitle')}
              </SuggestionListItemSubtitle>
            </SuggestionListItemText>
          </SuggestionListItem>
        )}
      </SuggestionListContainer>
    );
  }
}
