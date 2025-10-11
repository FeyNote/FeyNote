import {
  PaneableComponent,
  PaneableComponentProps,
} from '../../context/globalPane/PaneableComponent';

export interface CustomDragStateData<T extends PaneableComponent> {
  component: T;
  props: PaneableComponentProps[T];
}

interface CustomDragState {
  data?: CustomDragStateData<PaneableComponent>;
}

const customDragState: CustomDragState = {};

export const getCustomDragData = () => {
  return customDragState.data;
};

export const setCustomDragData = <T extends PaneableComponent>(
  data: CustomDragStateData<T>,
) => {
  customDragState.data = data;
};

export const clearCustomDragData = () => {
  customDragState.data = undefined;
};
