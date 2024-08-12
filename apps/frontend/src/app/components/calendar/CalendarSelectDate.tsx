import { applyUpdate, Doc as YDoc } from 'yjs';
import type { ArtifactDTO } from '@feynote/prisma/types';
import { useEffect, useState } from 'react';
import { trpc } from '../../../utils/trpc';
import { useProgressBar } from '../../../utils/useProgressBar';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { IonInput, useIonToast } from '@ionic/react';
import type { TypedMap } from 'yjs-types';
import type { YCalendarMap } from '@feynote/shared-utils';
import { CalendarSelectDateInput } from './CalendarSelectDateInput';
import { useTranslation } from 'react-i18next';

interface Props {
  artifactId: string;
  artifact: ArtifactDTO;
  yDoc?: YDoc;
  onSubmit: (date: string) => void;
}

export const CalendarSelectDate: React.FC<Props> = (props) => {
  const [yDoc, setYDoc] = useState(props.yDoc);
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [presentToast] = useIonToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!yDoc) {
      const progress = startProgressBar();
      trpc.artifact.getArtifactYBinById
        .query({
          id: props.artifactId,
        })
        .then((artifact) => {
          const doc = new YDoc();
          applyUpdate(doc, artifact.yBin);
          setYDoc(doc);
        })
        .catch((e) => {
          handleTRPCErrors(e, presentToast);
        })
        .finally(() => {
          progress.dismiss();
        });
    }
  }, [props.artifactId]);

  if (!yDoc) {
    return <div>{ProgressBar}</div>;
  }

  const calendarMap = yDoc.getMap('calendar') as TypedMap<
    Partial<YCalendarMap>
  >;
  const configMap = calendarMap.get('config');

  return (
    <div>
      {ProgressBar}
      {yDoc && !configMap && t('calendar.uninitialized')}
      {configMap && (
        <CalendarSelectDateInput
          configMap={configMap}
          onSubmit={props.onSubmit}
        />
      )}
    </div>
  );
};
