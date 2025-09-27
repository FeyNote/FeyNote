import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Actions, Layout, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { useGlobalPaneContext } from './context/globalPane/GlobalPaneContext';
import { Pane } from './components/pane/Pane';
import { IonButton } from '@ionic/react';
import { usePreferencesContext } from './context/preferences/PreferencesContext';
import { LuPanelLeft, LuPanelRight } from 'react-icons/lu';
import { LeftSideMenu } from './components/pane/LeftSideMenu';
import { PreferenceNames } from '@feynote/shared-utils';
import { RightSideMenu } from './components/pane/RightSideMenu';
import { NewPaneButton } from './components/pane/NewPaneButton';
import { t } from 'i18next';
import {
  PaneableComponent,
  paneableComponentNameToDefaultI18nTitle,
} from './context/globalPane/PaneableComponent';
import {
  clearCustomDragData,
  getCustomDragData,
  setCustomDragData,
  startTreeDrag,
} from './utils/artifactTree/customDrag';
import { PaneTabContextMenu } from './components/pane/PaneTabContextMenu';

const MENU_SIZE_PX = 300;
/**
 * The minimum required screen size to allow user to have both menus open at once
 */
const MIN_SCREEN_DOUBLE_MENU_PX = MENU_SIZE_PX * 3.5;
/**
 * The minimum required screen size to show both menu buttons (too small and they overlap)
 */
const MIN_SCREEN_DOUBLE_MENU_BUTTON_PX = MENU_SIZE_PX + 100;

const DockContainer = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;

  .flexlayout__layout {
    --color-text: var(--ion-text-color, #000000);
    --color-background: var(--ion-background-color, #ffffff);
    --color-base: var(--ion-background-color, #ffffff);
    --color-tab-selected-background: var(--ion-background-color, #ffffff);
    --color-tabset-background-selected: var(--ion-background-color, #ffffff);
    --color-1: var(--ion-background-color-step-100);
    --color-2: var(--ion-background-color-step-200);
    --color-3: var(--ion-background-color-step-300);
    --color-4: var(--ion-background-color-step-400);
    --color-5: var(--ion-background-color-step-500);
    --color-6: var(--ion-background-color-step-600);
  }

  .flexlayout__splitter {
    z-index: 1;
  }

  .flexlayout__tabset_tabbar_outer_top {
    background: var(--ion-card-background, #ffffff);
  }

  .flexlayout__tabset:first-child .flexlayout__tabset_tabbar_outer_top {
    padding-left: 30px;
    padding-right: 30px;
  }

  .flexlayout__tabset_tabbar_inner {
    flex-grow: 0;
  }

  .flexlayout__tabset_tabbar_inner_tab_container {
    // Must override styling that FlexLayout adds directly to the element dynamically with JS
    width: 100% !important;
    position: relative;
  }

  .flexlayout__tab_button {
    position: relative;
    display: grid;
    grid-template-columns: auto 16px;
    margin-left: 0;
    margin-right: 0;
    border-radius: 6px 6px 0 0;
    max-width: 200px;
    white-space: nowrap;

    &:first-child {
      margin-left: 6px;
    }

    &:hover {
      background-color: var(--color-tab-unselected-background);
    }

    .flexlayout__tab_button_content {
      display: block;
      text-wrap: nowrap;
      min-width: 0;
      flex-shrink: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 0.825rem;
    }
  }

  .flexlayout__tab_button--selected {
    --tab-curve: 10px;
    --tab-outline-width: 0;
    --tab-outline-color: var(--ion-background-color, #ffffff);
    --tab-background-active: var(--ion-background-color, #ffffff);

    &::before,
    &::after {
      box-shadow:
        inset 0 0 0 var(--tab-outline-width) var(--tab-outline-color),
        0 0 0 calc(var(--tab-curve) * 4) var(--tab-background-active);
      position: absolute;
      bottom: 0;
      content: '';
      width: calc(var(--tab-curve) * 2);
      height: calc(var(--tab-curve) * 2);
      border-radius: 100%;
    }

    &::before {
      left: calc(var(--tab-curve) * -2);
      clip-path: inset(50% calc(var(--tab-curve) * -1) 0 50%);
    }

    &::after {
      right: calc(var(--tab-curve) * -2);
      clip-path: inset(50% 50% 0 calc(var(--tab-curve) * -1));
    }

    &:hover {
      background-color: var(--color-tab-selected-background);
    }
  }

  .flexlayout__tab_button--unselected {
    background-color: rgba(
      var(--ion-background-color-rgb, rgb(255, 255, 255)),
      0.5
    );
  }

  .flexlayout__tab_button_trailing {
    visibility: visible;
  }

  .flexlayout__tab_button_overflow {
    display: none;
  }

  .flexlayout__tabset_tabbar_outer_top {
    border: none;
  }
`;

const Menu = styled.div<{
  $side: 'left' | 'right';
  $open: boolean;
}>`
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--ion-background-color);

  ${(props) =>
    props.$open &&
    `
    ${
      props.$side === 'left'
        ? `
      border-right: 1px solid var(--ion-card-background, #dddddd);
    `
        : `
      border-left: 1px solid var(--ion-card-background, #dddddd);
    `
    }
  `}
`;

const MenuInner = styled.div`
  width: ${MENU_SIZE_PX}px;
  min-height: 100%;
  overflow: hidden;
`;

const MenuButton = styled(IonButton)`
  background: var(--ion-card-background, #ffffff);
`;

const MainGrid = styled.div<{
  $leftMenuOpen: boolean;
  $rightMenuOpen: boolean;
}>`
  display: grid;
  height: 100%;

  --left-menu-size: 0px;
  ${(props) =>
    props.$leftMenuOpen &&
    `
    --left-menu-size: min(${MENU_SIZE_PX}px, 90vw);
  `}
  --right-menu-size: 0px;
  ${(props) =>
    props.$rightMenuOpen &&
    `
    --right-menu-size: min(${MENU_SIZE_PX}px, 90vw);
  `}

  grid-template-columns: var(--left-menu-size) auto var(--right-menu-size);
  transition: 0.4s;
`;

const LAST_PANE_STATE_LOCALSTORAGE_KEY = 'lastPaneState';
export const Workspace: React.FC = () => {
  const { _model, _onActionListener, _onModelChangeListener } =
    useGlobalPaneContext();
  const { getPreference } = usePreferencesContext();

  const [lastPaneState] = useState(() => {
    return JSON.parse(
      localStorage.getItem(LAST_PANE_STATE_LOCALSTORAGE_KEY) || '{}',
    );
  });
  const [leftMenuOpen, setLeftMenuOpen] = useState(() => {
    if (getPreference(PreferenceNames.PanesRememberOpenState)) {
      return !!(
        lastPaneState.leftPaneOpen ??
        getPreference(PreferenceNames.LeftPaneStartOpen)
      );
    } else {
      return getPreference(PreferenceNames.LeftPaneStartOpen);
    }
  });
  const [rightMenuOpen, setRightMenuOpen] = useState(() => {
    if (getPreference(PreferenceNames.PanesRememberOpenState)) {
      return !!(
        lastPaneState.rightPaneOpen ??
        getPreference(PreferenceNames.RightPaneStartOpen)
      );
    } else {
      return getPreference(PreferenceNames.RightPaneStartOpen);
    }
  });

  useEffect(() => {
    if (
      lastPaneState.leftPaneOpen !== leftMenuOpen ||
      lastPaneState.rightPaneOpen !== rightMenuOpen
    ) {
      localStorage.setItem(
        LAST_PANE_STATE_LOCALSTORAGE_KEY,
        JSON.stringify({
          leftPaneOpen: leftMenuOpen,
          rightPaneOpen: rightMenuOpen,
        }),
      );
    }
  }, [leftMenuOpen, rightMenuOpen]);

  const toggleLeftSideMenu = () => {
    if (!leftMenuOpen && window.innerWidth < MIN_SCREEN_DOUBLE_MENU_PX) {
      setRightMenuOpen(false);
    }
    setLeftMenuOpen(!leftMenuOpen);
  };

  const toggleRightSideMenu = () => {
    if (!rightMenuOpen && window.innerWidth < MIN_SCREEN_DOUBLE_MENU_PX) {
      setLeftMenuOpen(false);
    }
    setRightMenuOpen(!rightMenuOpen);
  };

  useEffect(() => {
    const listener = (event: DragEvent) => {
      if (!(event.target instanceof HTMLElement)) return;

      // We exit early if there's already drag data since this event listener is called extremely
      // frequently and querySelector is expensive
      const customDragData = getCustomDragData();
      if (customDragData) return;

      const layoutPath = event.target.querySelector('[data-layout-path]');
      if (!layoutPath) {
        return;
      }

      const nodeId = event.target
        .querySelector('[data-node-id]')
        ?.getAttribute('data-node-id');
      if (!nodeId) {
        return;
      }

      const node = _model.getNodeById(nodeId);
      if (node?.getType() !== 'tab') return;
      const config = (node as TabNode).getConfig();
      if (!config || !config.component || !config.props) return;

      setCustomDragData({
        component: config.component,
        props: config.props,
      });

      if (config.component === PaneableComponent.Artifact) {
        startTreeDrag();
      }
    };

    window.addEventListener('drag', listener);
    return () => {
      window.removeEventListener('drag', listener);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      clearCustomDragData();
    };

    window.addEventListener('dragend', listener);
    return () => {
      window.removeEventListener('dragend', listener);
    };
  }, []);

  const showLeftMenuButton =
    window.innerWidth > MIN_SCREEN_DOUBLE_MENU_BUTTON_PX ||
    !rightMenuOpen ||
    leftMenuOpen;
  const showRightMenuButton =
    window.innerWidth > MIN_SCREEN_DOUBLE_MENU_BUTTON_PX ||
    !leftMenuOpen ||
    rightMenuOpen;

  return (
    <MainGrid $leftMenuOpen={leftMenuOpen} $rightMenuOpen={rightMenuOpen}>
      <Menu $side="left" $open={leftMenuOpen}>
        <MenuInner>
          <LeftSideMenu />
        </MenuInner>
      </Menu>
      <DockContainer>
        <Layout
          model={_model}
          factory={(arg) => (
            <Pane
              id={arg.getId()}
              navigationEventId={arg.getConfig().navigationEventId}
            />
          )}
          onRenderTabSet={(node, renderValues) => {
            if (node.getType() !== 'tabset') return;

            renderValues.buttons.push(
              <NewPaneButton key="newpanebutton" tabsetId={node.getId()} />,
            );
          }}
          onRenderTab={(node, renderValues) => {
            // data-node-id is used for dragging interactions since flexlayout-react doesn't provide
            // a way to figure out what the node is when dragging
            const paneId = node.getId();
            renderValues.content = (
              <PaneTabContextMenu paneId={paneId}>
                <div data-node-id={node.getId()}>{renderValues.content}</div>
              </PaneTabContextMenu>
            );
          }}
          onAction={_onActionListener}
          onModelChange={_onModelChangeListener}
          onAuxMouseClick={(node, event) => {
            if (event.button === 1 && node.getType() === 'tab') {
              _model.doAction(Actions.deleteTab(node.getId()));
            }
          }}
          onExternalDrag={() => {
            const customDragData = getCustomDragData();
            if (!customDragData) return undefined;

            const { component, props } = customDragData;

            return {
              json: {
                id: crypto.randomUUID(),
                type: 'tab',
                component,
                name: t(paneableComponentNameToDefaultI18nTitle[component]),
                config: {
                  component,
                  props,
                  navigationEventId: crypto.randomUUID(),
                },
              },
              // Unused, but kept for reference --
              //onDrop: (node?: Node, event?: React.DragEvent<HTMLElement>) => {
              //  if (!node || !event) return;  // aborted drag
              //  return; // Do something with the drop event (now has access to dataTransfer)
              //}
            };
          }}
        />
        {showLeftMenuButton && (
          <MenuButton
            style={{ position: 'absolute', left: 0 }}
            fill="clear"
            onClick={toggleLeftSideMenu}
            size="small"
          >
            <div slot="icon-only">
              <LuPanelLeft />
            </div>
          </MenuButton>
        )}
        {showRightMenuButton && (
          <MenuButton
            style={{ position: 'absolute', right: 0 }}
            fill="clear"
            onClick={toggleRightSideMenu}
            size="small"
          >
            <div slot="icon-only">
              <LuPanelRight />
            </div>
          </MenuButton>
        )}
      </DockContainer>
      <Menu $side="right" $open={rightMenuOpen}>
        <MenuInner>
          <RightSideMenu />
        </MenuInner>
      </Menu>
    </MainGrid>
  );
};
