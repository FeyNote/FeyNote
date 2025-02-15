import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Doc as YDoc, Map as YMap } from 'yjs';
import {
  memo,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type MutableRefObject,
} from 'react';
import { CalendarRenderer } from './CalendarRenderer';
import type { TypedMap } from 'yjs-types';
import {
  ARTIFACT_META_KEY,
  Edge,
  generateGregorianSundayCalendarConfig,
  YCalendarConfig,
  type YCalendarMap,
} from '@feynote/shared-utils';
import { ymdToDatestamp } from './ymdToDatestamp';
import { CalendarConfig } from './CalendarConfig';
import { getYMDFromSpecifier } from './getYMDFromSpecifier';
import { useTranslation } from 'react-i18next';
import { IonItem } from '@ionic/react';
import { ArtifactCalendarStyles } from './ArtifactCalendarStyles';
import { ArtifactTitleInput } from '../editor/ArtifactTitleInput';
import styled from 'styled-components';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { useEdgesForArtifactId } from '../../utils/edgesReferences/useEdgesForArtifactId';

const BottomSpacer = styled.div`
  height: 100px;
`;

interface Props {
  artifactId: string | undefined;
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
  const setCenterRef = useRef<(center: string) => void>(undefined);
  const yMeta = useObserveYArtifactMeta(yDoc);
  const title = yMeta.title ?? '';
  const theme = yMeta.theme ?? 'default';
  const titleBodyMerge = yMeta.titleBodyMerge ?? true;
  const { t } = useTranslation();
  const { incomingEdges } = useEdgesForArtifactId(props.artifactId);

  const { calendarMap, configMap } = useMemo(() => {
    const calendarMap = yDoc.getMap('calendar') as TypedMap<
      Partial<YCalendarMap>
    >;
    if (!calendarMap.get('config')) {
      const configMap = new YMap() as TypedMap<Partial<YCalendarConfig>>;
      yDoc.transact(() => {
        calendarMap.set('config', configMap);
        for (const [key, value] of Object.entries(
          generateGregorianSundayCalendarConfig(),
        )) {
          configMap.set(key as keyof YCalendarConfig, value);
        }
      });
    }
    const configMap = calendarMap.get('config');

    return {
      calendarMap,
      configMap,
    };
  }, [yDoc]);

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

  const setMetaProp = (metaPropName: string, value: string) => {
    yDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const edgesByDay = useMemo(
    () =>
      incomingEdges.reduce<Record<string, Edge[]>>(
        (edgesByDay, incomingEdge) => {
          if (!incomingEdge.targetArtifactDate) {
            // TODO: we probably want to consider displaying references that don't have dates below the calendar
            return edgesByDay;
          }

          const date = incomingEdge.targetArtifactDate;
          if (date.includes('<>')) {
            const [_start, _end] = date.split('-');
            // TODO: add support for date ranges
          } else {
            const ymd = getYMDFromSpecifier(incomingEdge.targetArtifactDate);
            if (!ymd) return edgesByDay;
            const datestamp = ymdToDatestamp(ymd);
            edgesByDay[datestamp] ||= [];
            edgesByDay[datestamp].push(incomingEdge);
          }

          return edgesByDay;
        },
        {},
      ),
    [incomingEdges],
  );

  if (!configMap) return;

  const titleInput = (
    <IonItem lines="none" className="artifactTitle">
      <ArtifactTitleInput
        disabled={!props.editable}
        placeholder={t('artifactRenderer.title.placeholder')}
        value={title}
        onIonInput={(event) => {
          setMetaProp('title', event.target.value?.toString() || '');
          props.onTitleChange?.(event.target.value?.toString() || '');
        }}
        type="text"
      ></ArtifactTitleInput>
    </IonItem>
  );

  return (
    <>
      {!titleBodyMerge && titleInput}
      <ArtifactCalendarStyles data-theme={theme}>
        {titleBodyMerge && titleInput}
        {props.editable && (
          <CalendarConfig
            yDoc={yDoc}
            configMap={configMap}
            setCenterRef={props.setCenterRef || setCenterRef}
          />
        )}

        <CalendarRenderer
          viewType={props.viewType}
          edgesByDay={edgesByDay}
          centerDate={props.centerDate}
          configMap={configMap}
          setCenterRef={props.setCenterRef || setCenterRef}
          selectedDate={props.selectedDate}
          onDayClicked={props.onDayClicked}
        />
      </ArtifactCalendarStyles>
      <BottomSpacer />
    </>
  );
});
