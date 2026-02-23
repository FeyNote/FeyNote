import {
  PaneableComponent,
  PaneableComponentProps,
} from '../context/globalPane/PaneableComponent';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../context/globalPane/GlobalPaneContext';
import { usePaneContext } from '../context/pane/PaneContext';

export const useNavigateWithKeyboardHandler = (alwaysSelect?: boolean) => {
  const paneContextData = usePaneContext(true);
  const paneId = paneContextData?.pane.id;
  const { navigate } = useGlobalPaneContext();

  return {
    navigateWithKeyboardHandler: <T extends PaneableComponent>(
      event:
        | MouseEvent
        | KeyboardEvent
        | React.MouseEvent
        | React.KeyboardEvent,
      component: T,
      props: PaneableComponentProps[T],
    ) => {
      const paneTransition =
        event.ctrlKey || event.metaKey
          ? PaneTransition.NewTab
          : PaneTransition.Push;
      navigate(
        paneId,
        component,
        props,
        paneTransition,
        alwaysSelect || !(event.metaKey || event.ctrlKey),
      );
    },
  };
};
