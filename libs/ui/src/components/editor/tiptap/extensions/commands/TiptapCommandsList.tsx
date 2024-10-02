import { Component } from 'react';
import { MdHorizontalRule } from 'react-icons/md';
import styled from 'styled-components';

const SuggestionListContainer = styled.div`
  font-family: var(--ion-font-family);
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
  background-color: var(--ion-card-background);
  ${(props) =>
    props.$selected
      ? `background-color: var(--ion-background-color, #dddddd);`
      : ``}
  width: 100%;
  min-height: 52px;

  padding-top: 6px;
  padding-bottom: 6px;

  &:hover {
    background-color: var(--ion-background-color, #dddddd);
  }
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

export interface CommandItem {
  title: string;
  subtitle: string;
  icon: React.FC<any>;
}

interface Props {
  items: CommandItem[];
  command: (...args: any) => void;
}

interface State {
  selectedIndex: number;
}

export class TiptapCommandsList extends Component<Props, State> {
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
    const item = this.props.items[index];

    if (item) {
      this.props.command(item);
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
                <item.icon size={18} />
              </SuggestionListItemIcon>
              <SuggestionListItemText>
                <SuggestionListItemTitle>{item.title}</SuggestionListItemTitle>
                <SuggestionListItemSubtitle>
                  {item.subtitle}
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
              <SuggestionListItemTitle>No results</SuggestionListItemTitle>
              <SuggestionListItemSubtitle>
                No results for search text
              </SuggestionListItemSubtitle>
            </SuggestionListItemText>
          </SuggestionListItem>
        )}
      </SuggestionListContainer>
    );
  }
}
