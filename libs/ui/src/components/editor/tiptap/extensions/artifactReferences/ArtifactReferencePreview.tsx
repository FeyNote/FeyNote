import styled from 'styled-components';
import { useContext, useMemo, useRef, useState } from 'react';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { TiptapPreview } from '../../../TiptapPreview';
import { ArtifactCalendar } from '../../../../calendar/ArtifactCalendar';
import { useScrollBlockIntoView } from '../../../useScrollBlockIntoView';
import { useScrollDateIntoView } from '../../../../calendar/useScrollDateIntoView';
import { ArtifactDraw } from '../../../../draw/ArtifactDraw';
import { SessionContext } from '../../../../../context/session/SessionContext';
import { getFileRedirectUrl } from '../../../../../utils/files/getFileRedirectUrl';
import { useObserveYArtifactMeta } from '../../../../../utils/useObserveYArtifactMeta';
import { useTranslation } from 'react-i18next';
import { StyledBoundedFloatingWindow } from '../../../../StyledBoundedFloatingWindow';

export interface ReferencePreviewInfo {
  artifactYBin: Uint8Array | undefined;
  artifactInaccessible: boolean;
  isBroken: boolean;
}

const PREVIEW_WIDTH_PX = 600;
const PREVIEW_MIN_HEIGHT_PX = 100;
const PREVIEW_MAX_HEIGHT_PX = 300;

const Header = styled.h1`
  font-size: 1.2rem;
  margin: 0;
  margin-top: 4px;
  margin-bottom: 16px;
  padding: 0;
`;

interface Props {
  artifactId: string;
  previewTarget: HTMLElement;
  referenceText: string;
  artifactBlockId: string | undefined;
  artifactDate: string | undefined;
  /**
   * This is expected to come from useArtifactPreviewTimer but could be passed in manually
   */
  previewInfo: ReferencePreviewInfo;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const ArtifactReferencePreview: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { session } = useContext(SessionContext);
  const [ready, setReady] = useState(false);

  const yDoc = useMemo(() => {
    const yDoc = new YDoc();

    if (props.previewInfo.artifactYBin) {
      applyUpdate(yDoc, props.previewInfo.artifactYBin);
    }

    return yDoc;
  }, [props.artifactId]);

  const artifactMeta = useObserveYArtifactMeta(yDoc);

  useScrollBlockIntoView(
    {
      blockId: props.artifactBlockId,
      containerRef,
      highlight: true,
    },
    [ready],
  );
  useScrollDateIntoView(
    {
      date: props.artifactDate,
      containerRef,
    },
    [ready],
  );

  const previewContent = (
    <>
      <Header>{artifactMeta.title}</Header>
      {artifactMeta.type === 'tiptap' && (
        <TiptapPreview
          artifactId={props.artifactId}
          yDoc={yDoc}
          onReady={() => setReady(true)}
        />
      )}
      {artifactMeta.type === 'calendar' && (
        <ArtifactCalendar
          artifactId={props.artifactId}
          y={yDoc}
          centerDate={props.artifactDate}
          editable={false}
          viewType="fullsize"
          onReady={() => setReady(true)}
        />
      )}
      {artifactMeta.type === 'tldraw' && (
        <ArtifactDraw
          artifactId={props.artifactId}
          yDoc={yDoc}
          editable={false}
          getFileUrl={(fileId) => {
            if (!session) return '';
            return getFileRedirectUrl({
              fileId,
              sessionToken: session.token,
            }).toString();
          }}
          onReady={() => setReady(true)}
        />
      )}
    </>
  );

  const inaccessibleMessage = (
    <>
      <Header>{t('referencePreview.inaccessible')}</Header>
      {t('referencePreview.inaccessible.message')}
    </>
  );

  const brokenMessage = (
    <>
      <Header>{t('referencePreview.broken')}</Header>
      {props.referenceText && (
        <div>
          {t('referencePreview.broken.message')}
          <br />
          {props.referenceText}
        </div>
      )}
    </>
  );

  return (
    <StyledBoundedFloatingWindow
      ref={containerRef}
      floatTarget={props.previewTarget}
      width={PREVIEW_WIDTH_PX}
      minHeight={PREVIEW_MIN_HEIGHT_PX}
      maxHeight={PREVIEW_MAX_HEIGHT_PX}
      onClick={(event) => props.onClick?.(event)}
    >
      {props.previewInfo.isBroken && brokenMessage}
      {props.previewInfo.artifactInaccessible && inaccessibleMessage}
      {!props.previewInfo.artifactInaccessible &&
        !props.previewInfo.isBroken &&
        previewContent}
    </StyledBoundedFloatingWindow>
  );
};
