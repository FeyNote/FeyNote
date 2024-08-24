import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { Layout } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { PaneControlContext } from './context/paneControl/PaneControlContext';
import { Pane } from './components/pane/Pane';
import { IonButton } from '@ionic/react';
import { PreferencesContext } from './context/preferences/PreferencesContext';
import { SidemenuContext } from './context/sidemenu/SidemenuContext';
import { LuPanelLeft, LuPanelRight } from 'react-icons/lu';
import { AuthenticatedMenuItems } from './components/pane/AuthenticatedMenuItems';
import { PreferenceNames } from '@feynote/shared-utils';

const MENU_SIZE_PX = '240';

const DockContainer = styled.div`
  position: relative;
  height: 100%;

  .flexlayout__layout {
    --color-text: var(--ion-text-color);
    --color-background: var(--ion-background-color);
    --color-base: var(--ion-background-color);
    --color-tab-selected-background: var(--ion-background-color);
    --color-tabset-background-selected: var(--ion-background-color);
    --color-1: var(--ion-background-color-step-100);
    --color-2: var(--ion-background-color-step-200);
    --color-3: var(--ion-background-color-step-300);
    --color-4: var(--ion-background-color-step-400);
    --color-5: var(--ion-background-color-step-500);
    --color-6: var(--ion-background-color-step-600);
  }

  .flexlayout__tabset_tabbar_outer_top {
    padding-left: 30px;
    padding-right: 30px;
    background: var(--ion-card-background);
  }

  .flexlayout__tabset_tabbar_inner_tab_container {
    // Must override styling that FlexLayout adds directly to the element dynamically with JS
    width: 100% !important;
  }

  .flexlayout__tab_button {
    position: relative;
    display: grid;
    grid-template-columns: auto 16px;
    margin-left: 6px;
    margin-right: 6px;
    border-radius: 6px 6px 0 0;
    max-width: 200px;
    white-space: nowrap;

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
    --tab-outline-color: var(--ion-background-color);
    --tab-background-active: var(--ion-background-color);

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
}>`
  ${(props) =>
    props.$side === 'left'
      ? `
    border-right: 1px solid var(--ion-card-background);
  `
      : `
    border-left: 1px solid var(--ion-card-background);
  `}
`;

const MenuInner = styled.div`
  width: ${MENU_SIZE_PX}px;
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
    --left-menu-size: ${MENU_SIZE_PX}px;
  `}
  --right-menu-size: 0px;
  ${(props) =>
    props.$rightMenuOpen &&
    `
    --right-menu-size: ${MENU_SIZE_PX}px;
  `}

  grid-template-columns: var(--left-menu-size) auto var(--right-menu-size);
  transition: 0.4s;
`;

export const Workspace: React.FC = () => {
  const { get, model } = useContext(PaneControlContext);
  const { getPreference } = useContext(PreferencesContext);

  const [leftMenuOpen, setLeftMenuOpen] = useState(
    getPreference(PreferenceNames.StartLeftPaneOpen),
  );
  const [rightMenuOpen, setRightMenuOpen] = useState(
    getPreference(PreferenceNames.StartRightPaneOpen),
  );

  const { contents: rightMenuContents } = useContext(SidemenuContext);

  return (
    <MainGrid $leftMenuOpen={leftMenuOpen} $rightMenuOpen={rightMenuOpen}>
      <Menu $side="left">
        <MenuInner>
          <AuthenticatedMenuItems />
        </MenuInner>
      </Menu>
      <DockContainer>
        <Layout
          model={model}
          factory={(arg) => <Pane id={arg.getId()} />}
          titleFactory={(arg) => get(arg.getId()).currentView.title}
        />
        <IonButton
          style={{ position: 'absolute', left: 0 }}
          fill="clear"
          onClick={() => setLeftMenuOpen(!leftMenuOpen)}
          size="small"
        >
          <div slot="icon-only">
            <LuPanelLeft />
          </div>
        </IonButton>
        <IonButton
          style={{ position: 'absolute', right: 0 }}
          fill="clear"
          onClick={() => setRightMenuOpen(!rightMenuOpen)}
          size="small"
        >
          <div slot="icon-only">
            <LuPanelRight />
          </div>
        </IonButton>
      </DockContainer>
      <Menu $side="right">
        <MenuInner>{rightMenuContents}</MenuInner>
      </Menu>
    </MainGrid>
  );
};
