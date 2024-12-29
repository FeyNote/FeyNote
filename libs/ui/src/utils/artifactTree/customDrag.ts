import {
  PaneableComponent,
  PaneableComponentProps,
} from '../../context/globalPane/PaneableComponent';

export interface CustomDragStateData<T extends PaneableComponent> {
  component: T;
  props: PaneableComponentProps[T];
}

interface CustomDragState {
  startTreeDrag?: () => void;
  data?: CustomDragStateData<PaneableComponent>;
}

const customDragState: CustomDragState = {};

const registerWindowCustomDragState = () => {
  const customWindow = window as unknown as {
    customDragState: CustomDragState | undefined;
  };
  customWindow.customDragState = customDragState;
};

export const getCustomDragData = () => {
  registerWindowCustomDragState();

  return customDragState.data;
};

export const setCustomDragData = <T extends PaneableComponent>(
  data: CustomDragStateData<T>,
) => {
  registerWindowCustomDragState();

  customDragState.data = data;
};

export const clearCustomDragData = () => {
  registerWindowCustomDragState();

  customDragState.data = undefined;
};

export const startTreeDrag = () => {
  registerWindowCustomDragState();

  customDragState.startTreeDrag?.();
};

export const registerStartTreeDrag = (startTreeDrag: () => void) => {
  registerWindowCustomDragState();

  customDragState.startTreeDrag = startTreeDrag;
};
