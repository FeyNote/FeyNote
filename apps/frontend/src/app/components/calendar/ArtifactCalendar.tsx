import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import {
  memo,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import { CalendarRenderer } from './CalendarRenderer';
import type { TypedMap } from 'yjs-types';
import type { ArtifactDTO } from '@feynote/prisma/types';
import {
  ARTIFACT_META_KEY,
  getMetaFromYArtifact,
  type YCalendarMap,
} from '@feynote/shared-utils';
import { ymdToDatestamp } from './ymdToDatestamp';
import { CalendarConfig } from './CalendarConfig';
import { getYMDFromSpecifier } from './getYMDFromSpecifier';
import type { ArtifactTheme } from '@prisma/client';
import { EventContext } from '../../context/events/EventContext';
import { useTranslation } from 'react-i18next';
import { IonInput, IonItem } from '@ionic/react';
import { EventName } from '../../context/events/EventName';
import { ArtifactCalendarStyles } from './ArtifactCalendarStyles';

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  incomingArtifactReferences: ArtifactDTO['incomingArtifactReferences'];
  y: YDoc | TiptapCollabProvider;
  centerDate?: string;
  editable: boolean;
  viewType: 'fullsize' | 'mini';
  onReady?: () => void;
  setCenterRef?: MutableRefObject<((center: string) => void) | undefined>;
  selectedDate?: string;
  onDayClicked?: (date: string) => void;
  onTitleChange?: (title: string) => void;
}

export const ArtifactCalendar: React.FC<Props> = memo((props) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const yDoc = props.y instanceof YDoc ? props.y : props.y.document;
  const setCenterRef = useRef<(center: string) => void>();
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<ArtifactTheme>('default');
  const { eventManager } = useContext(EventContext);
  const { t } = useTranslation();

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

  useEffect(() => {
    const artifactMetaMap = yDoc.getMap('artifactMeta');

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(yDoc);
      setTitle(yArtifactMeta.title ?? title);
      setTheme(yArtifactMeta.theme ?? theme);
    };

    listener();
    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [yDoc]);

  const setMetaProp = (metaPropName: string, value: any) => {
    (yDoc.getMap(ARTIFACT_META_KEY) as any).set(metaPropName, value);
  };

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
    <ArtifactCalendarStyles data-theme={theme}>
      <IonItem lines="none" className="artifactTitle">
        <IonInput
          disabled={!props.editable}
          placeholder={t('artifactRenderer.title.placeholder')}
          value={title}
          onIonInput={(event) => {
            setMetaProp('title', event.target.value || '');
            eventManager.broadcast([EventName.ArtifactTitleUpdated]);
            props.onTitleChange?.((event.target.value || '').toString());
          }}
          type="text"
        ></IonInput>
      </IonItem>
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
    </ArtifactCalendarStyles>
  );
});
