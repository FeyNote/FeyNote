import { useEffect } from 'react';
import { usePaneContext } from '../../context/pane/PaneContext';
import { IconButton } from '@radix-ui/themes';
import styled from 'styled-components';
import { DefaultPaneDropdownMenu } from './DefaultPaneDropdownMenu';
import { IoChevronBack, IoChevronForward, RxDotsHorizontal } from '../AppIcons';

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: var(--general-background);
  color: var(--text-color);
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
`;

interface Props {
  title: string;
  // Pass null to disable the popover. Not passing this prop will use the default context menu
  renderDropdownMenu?: ((children: React.ReactNode) => React.ReactNode) | null;
}

export const PaneNav: React.FC<Props> = (props) => {
  const { navigateHistoryBack, navigateHistoryForward, pane, renamePane } =
    usePaneContext();

  useEffect(() => {
    // Since pane itself is memoized, this does not cause re-render of entire pane, but rather just the tab title itself
    renamePane(props.title);
  }, [props.title]);

  const renderDropdownButton = () => {
    const contents = (
      <IconButton
        style={{ margin: '0' }}
        variant="ghost"
        size="1"
        disabled={props.renderDropdownMenu === null}
      >
        <RxDotsHorizontal size={18} />
      </IconButton>
    );

    if (props.renderDropdownMenu) {
      return props.renderDropdownMenu(contents);
    }
    if (props.renderDropdownMenu !== null) {
      return (
        <DefaultPaneDropdownMenu paneId={pane.id}>
          {contents}
        </DefaultPaneDropdownMenu>
      );
    }

    return contents;
  };

  return (
    <NavContainer>
      <NavGroup>
        <IconButton
          style={{ margin: '0' }}
          variant="ghost"
          size="1"
          onClick={() => navigateHistoryBack()}
          disabled={!pane.history.length}
        >
          <IoChevronBack size={18} />
        </IconButton>
        <IconButton
          style={{ margin: '0' }}
          variant="ghost"
          size="1"
          onClick={() => navigateHistoryForward()}
          disabled={!pane.forwardHistory.length}
        >
          <IoChevronForward size={18} />
        </IconButton>
      </NavGroup>
      <NavGroup style={{ marginLeft: 'auto' }}>
        {renderDropdownButton()}
      </NavGroup>
    </NavContainer>
  );
};
