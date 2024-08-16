import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { ArtifactEditorApplyTemplate } from '../editor/ArtifactEditor';
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type MutableRefObject,
} from 'react';
import { CalendarRenderer } from './CalendarRenderer';
import type { TypedMap } from 'yjs-types';
import type { ArtifactDTO } from '@feynote/prisma/types';
import type { YCalendarMap } from '@feynote/shared-utils';
import { ymdToDatestamp } from './ymdToDatestamp';
import { CalendarConfig } from './CalendarConfig';
import { getYMDFromSpecifier } from './getYMDFromSpecifier';

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
  y: YDoc | TiptapCollabProvider;
  applyTemplateRef?: React.MutableRefObject<
    ArtifactEditorApplyTemplate | undefined
  >;
  centerDate?: string;
  editable: boolean;
  viewType: 'fullsize' | 'mini';
  onReady?: () => void;
  setCenterRef?: MutableRefObject<((center: string) => void) | undefined>;
  selectedDate?: string;
  onDayClicked?: (date: string) => void;
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
    if (configMap) {
      setTimeout(() => {
        props.onReady?.();
      });
    }
  }, [configMap]);

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
          const ymd = getYMDFromSpecifier(incomingReference.targetArtifactDate);
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
    <>
      {props.editable && (
        <CalendarConfig
          yDoc={yDoc}
          configMap={configMap}
          setCenterRef={props.setCenterRef || setCenterRef}
        />
      )}

      <CalendarRenderer
        viewType={props.viewType}
        knownReferencesByDay={knownReferencesByDay}
        centerDate={props.centerDate}
        configMap={configMap}
        setCenterRef={props.setCenterRef || setCenterRef}
        selectedDate={props.selectedDate}
        onDayClicked={props.onDayClicked}
      />
    </>
  );
};
