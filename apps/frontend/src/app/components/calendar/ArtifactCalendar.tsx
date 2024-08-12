import { TiptapCollabProvider } from '@hocuspocus/provider';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import type { ArtifactTheme } from '@prisma/client';
import { ArtifactEditorApplyTemplate } from '../editor/ArtifactEditor';
import { useEffect, useMemo, useReducer } from 'react';
import { IonCard } from '@ionic/react';
import { CalendarRenderer } from './CalendarRenderer';
import type { TypedMap } from 'yjs-types';
import type { ArtifactDTO } from '@feynote/prisma/types';
import type { YCalendarMap } from '@feynote/shared-utils';
import { CalendarConfig } from './CalendarConfig';
import { getYMDFromReference } from './getYMDFromReference';
import { ymdToDatestamp } from './ymdToDatestamp';
import { renderFullsizeCalendar } from './renderFullsizeCalendar';
import type { CalendarRenderArgs } from './CalendarRenderArgs';

type IncomingArtifactReference = ArtifactDTO['incomingArtifactReferences'][0];

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
  yjsProvider: TiptapCollabProvider;
  theme: ArtifactTheme;
  applyTemplateRef?: React.MutableRefObject<
    ArtifactEditorApplyTemplate | undefined
  >;
  onReady?: () => void;
}

export const ArtifactCalendar: React.FC<Props> = (props) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const calendarMap = useMemo(
    () =>
      props.yjsProvider.document.getMap('calendar') as TypedMap<
        Partial<YCalendarMap>
      >,
    [_rerenderReducerValue],
  );
  const configMap = useMemo(
    () => calendarMap.get('config'),
    [_rerenderReducerValue, calendarMap],
  );

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };

    calendarMap.observeDeep(listener);
    return () => calendarMap.unobserveDeep(listener);
  }, [_rerenderReducerValue]);

  const knownReferencesByDay = useMemo(
    () =>
      props.incomingArtifactReferences.reduce<
        Record<string, IncomingArtifactReference[]>
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

  const renderCalendar = (args: CalendarRenderArgs) => {
    return renderFullsizeCalendar({
      ...args,
      knownReferencesByDay,
    });
  };

  if (!configMap) return;

  return (
    <IonCard>
      <CalendarConfig yDoc={props.yjsProvider.document} configMap={configMap} />

      <br />
      <br />

      <CalendarRenderer renderCalendar={renderCalendar} configMap={configMap} />
    </IonCard>
  );
};
