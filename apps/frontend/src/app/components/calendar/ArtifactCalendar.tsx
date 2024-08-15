import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import type { ArtifactTheme } from '@prisma/client';
import { ArtifactEditorApplyTemplate } from '../editor/ArtifactEditor';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { IonCard } from '@ionic/react';
import { CalendarRenderer } from './CalendarRenderer';
import type { TypedMap } from 'yjs-types';
import type { ArtifactDTO } from '@feynote/prisma/types';
import type { YCalendarMap } from '@feynote/shared-utils';
import { getYMDFromReference } from './getYMDFromReference';
import { ymdToDatestamp } from './ymdToDatestamp';
import { CalendarConfig } from './CalendarConfig';

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
  y: YDoc | TiptapCollabProvider;
  theme: ArtifactTheme;
  applyTemplateRef?: React.MutableRefObject<
    ArtifactEditorApplyTemplate | undefined
  >;
  editable: boolean;
  onReady?: () => void;
}

export const ArtifactCalendar: React.FC<Props> = (props) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const yDoc = props.y instanceof YDoc ? props.y : props.y.document;
  const setCenterRef = useRef<(center: string) => void>();

  const calendarMap = useMemo(() => {
    return yDoc.getMap('calendar') as TypedMap<Partial<YCalendarMap>>;
  }, [yDoc]);
  const configMap = calendarMap.get('config');

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };

    calendarMap.observeDeep(listener);
    return () => calendarMap.unobserveDeep(listener);
  }, [calendarMap]);

  useEffect(() => {
    props.onReady?.();
  }, []);

  const knownReferencesByDay = useMemo(
    () =>
      props.incomingArtifactReferences.reduce<
        Record<string, ArtifactDTO['incomingArtifactReferences']>
      >((knownReferencesByDay, incomingReference) => {
        if (!incomingReference.targetArtifactDate) {
          // TODO: we probably want to consider displaying references that don't have dates below the calendar
          return knownReferencesByDay;
        }

        const date = incomingReference.targetArtifactDate;
        if (date.includes('<>')) {
          const [start, end] = date.split('-');
          // TODO: add support for date ranges
        } else {
          const ymd = getYMDFromReference(incomingReference);
          if (!ymd) return knownReferencesByDay;
          const datestamp = ymdToDatestamp(ymd);
          knownReferencesByDay[datestamp] ||= [];
          knownReferencesByDay[datestamp].push(incomingReference);
        }

        return knownReferencesByDay;
      }, {}),
    [props.incomingArtifactReferences],
  );

  if (!configMap) return;

  return (
    <IonCard>
      {props.editable && (
        <CalendarConfig
          yDoc={yDoc}
          configMap={configMap}
          setCenterRef={setCenterRef}
        />
      )}

      <br />
      <br />

      <CalendarRenderer
        options={{
          type: 'fullsize',
          knownReferencesByDay,
        }}
        configMap={configMap}
        setCenterRef={setCenterRef}
      />
    </IonCard>
  );
};
