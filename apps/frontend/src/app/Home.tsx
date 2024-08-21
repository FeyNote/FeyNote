import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { SessionContext } from './context/session/SessionContext';
import { routes } from './routes';
import styled from 'styled-components';
import { Layout } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { PaneControlContext } from './context/paneControl/PaneControlContext';
import { Pane } from './components/pane/Pane';

const DockContainer = styled.div`
  position: relative;
  height: 100%;

  .flexlayout__layout {
    --color-text: var(--ion-text-color);
    --color-background: var(--ion-background-color);
    --color-base: var(--ion-background-color);
    --color-tab-selected-background: var(--ion-card-background);
    --color-tabset-background-selected: var(--ion-background-color);
    --color-1: var(--ion-background-color-step-100);
    --color-2: var(--ion-background-color-step-200);
    --color-3: var(--ion-background-color-step-300);
    --color-4: var(--ion-background-color-step-400);
    --color-5: var(--ion-background-color-step-500);
    --color-6: var(--ion-background-color-step-600);
  }

  .flexlayout__tabset_tabbar_inner_tab_container {
    // Must override styling that FlexLayout adds directly to the element dynamically with JS
    width: 100% !important;
  }

  .flexlayout__tab_button {
    position: relative;
    margin-left: 6px;
    margin-right: 6px;
    border-radius: 6px 6px 0 0;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .flexlayout__tab_button_content {
      display: block;
      text-wrap: nowrap;
      min-width: 0;
      flex-shrink: 1;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .flexlayout__tab_button--selected {
    --tab-curve: 6px;
    --tab-outline-width: 0;
    --tab-outline-color: var(--ion-card-background);
    --tab-background-active: var(--ion-card-background);

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

export const Home: React.FC = () => {
  const { panes, get, model } = useContext(PaneControlContext);

  return (
    <DockContainer>
      <Layout
        model={model}
        factory={(arg) => <Pane id={arg.getId()} />}
        titleFactory={(arg) => get(arg.getId()).currentView.title}
      />
    </DockContainer>
  );
};
