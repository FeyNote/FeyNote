import { Actions, DockLocation, type Model } from 'flexlayout-react';
import { t } from 'i18next';
import {
  PaneableComponent,
  paneableComponentNameToDefaultI18nTitle,
} from '../context/globalPane/PaneableComponent';

export const createNewTab = (model: Model, tabsetId: string) => {
  const id = crypto.randomUUID();
  model.doAction(
    Actions.addNode(
      {
        id,
        type: 'tab',
        component: id,
        name: t(
          paneableComponentNameToDefaultI18nTitle[
            PaneableComponent.NewArtifact
          ],
        ),
        config: {
          component: PaneableComponent.NewArtifact,
          props: {},
          navigationEventId: crypto.randomUUID(),
        },
      },
      tabsetId,
      DockLocation.CENTER,
      -1,
      true,
    ),
  );
};
