import { useMemo, useReducer, useRef } from 'react';
import { IGlobalAttributes, IJsonModel, Model } from 'flexlayout-react';
import { PaneableComponent } from './PaneableComponent';
import { t } from 'i18next';

export const SAVED_LAYOUT_LOCAL_STORAGE_KEY = 'savedLayout';

const defaultGlobalLayoutAttributes = {
  tabEnableRename: false,
  tabEnablePopoutIcon: false,
  tabDragSpeed: 0.2,
  tabSetMinWidth: 200,
  tabSetEnableMaximize: false,
} satisfies IGlobalAttributes;

function getDefaultLayout() {
  return Model.fromJson({
    global: {
      ...defaultGlobalLayoutAttributes,
    },
    borders: [],
    layout: {
      type: 'row',
      weight: 100,
      children: [
        {
          type: 'tabset',
          weight: 50,
          children: [
            {
              id: 'default',
              type: 'tab',
              name: t('dashboard.title'),
              config: {
                component: PaneableComponent.Dashboard,
                props: {},
                navigationEventId: crypto.randomUUID(),
              },
            },
          ],
        },
      ],
    },
  });
}

export const useFlexLayout = () => {
  const [_, triggerRerender] = useReducer((x) => x + 1, 0);

  const savedLayout = useMemo(() => {
    const savedLayoutStr = localStorage.getItem(SAVED_LAYOUT_LOCAL_STORAGE_KEY);

    if (savedLayoutStr) {
      const json = JSON.parse(savedLayoutStr);
      return Model.fromJson(json);
    } else {
      return getDefaultLayout();
    }
  }, []);

  const layoutRef = useRef<Model>(savedLayout);

  const saveLayout = (): void => {
    localStorage.setItem(
      SAVED_LAYOUT_LOCAL_STORAGE_KEY,
      JSON.stringify(layoutRef.current.toJson()),
    );
  };

  const applyLayoutJson = (json: IJsonModel) => {
    layoutRef.current = Model.fromJson(json);
    saveLayout();
    triggerRerender();
  };

  const resetLayout = (): void => {
    layoutRef.current = getDefaultLayout();
    saveLayout();
    triggerRerender();
  };

  return {
    layout: layoutRef.current,
    applyLayoutJson,
    resetLayout,
    saveLayout,
  };
};
