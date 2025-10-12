import {
  PaneableComponent,
  PaneableComponentProps,
} from '../context/globalPane/PaneableComponent';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../context/globalPane/GlobalPaneContext';
import { usePaneContext } from '../context/pane/PaneContext';
import { useState } from 'react';

/**
 * This helpfully wraps navigate with an event handler that detects ctrl/cmd+click
 * NOTE: It is recommended to pass usePaneContextId if your component is rendered within a pane!
 */
export const useNavigateWithKeyboardHandler = (usePaneContextId?: boolean) => {
  const [_usePaneContextId] = useState(usePaneContextId);
  let paneId = undefined;
  if (_usePaneContextId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const paneContextData = usePaneContext();
    paneId = paneContextData.pane.id;
  }
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
        !(event.metaKey || event.ctrlKey),
      );
    },
  };
};
