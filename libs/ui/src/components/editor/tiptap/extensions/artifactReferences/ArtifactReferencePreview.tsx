import styled from 'styled-components';
import { useContext, useMemo, useRef } from 'react';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { BoundedFloatingWindow } from '../../../../BoundedFloatingWindow';
import { TiptapPreview } from '../../../TiptapPreview';
import { ArtifactCalendar } from '../../../../calendar/ArtifactCalendar';
import { useScrollBlockIntoView } from '../../../useScrollBlockIntoView';
import { useScrollDateIntoView } from '../../../../calendar/useScrollDateIntoView';
import { ArtifactDraw } from '../../../../draw/ArtifactDraw';
import { SessionContext } from '../../../../../context/session/SessionContext';
import { getFileRedirectUrl } from '../../../../../utils/files/getFileRedirectUrl';
import { useObserveYArtifactMeta } from '../../../../../utils/useObserveYArtifactMeta';
import { useTranslation } from 'react-i18next';

export interface ReferencePreviewInfo {
  artifactYBin: Uint8Array | undefined;
  artifactInaccessible: boolean;
  isBroken: boolean;
}

const PREVIEW_WIDTH_PX = 600;
const PREVIEW_MIN_HEIGHT_PX = 100;
const PREVIEW_MAX_HEIGHT_PX = 300;

const StyledBoundedFloatingWindow = styled(BoundedFloatingWindow)`
  overflow-y: auto;
  background: var(--ion-background-color, #ffffff);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.3);
  padding: 10px;
`;

const Header = styled.h4`
  margin-top: 8px;
  margin-bottom: 16px;
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

  const yDoc = useMemo(() => {
    const yDoc = new YDoc();

    if (props.previewInfo.artifactYBin) {
      applyUpdate(yDoc, props.previewInfo.artifactYBin);
    }

    return yDoc;
  }, [props.artifactId]);

  const artifactMeta = useObserveYArtifactMeta(yDoc);

  useScrollBlockIntoView(props.artifactBlockId, [], containerRef);
  useScrollDateIntoView(props.artifactDate, [], containerRef);

  const previewContent = (
    <>
      <Header>{artifactMeta.title}</Header>
      {artifactMeta.type === 'tiptap' && (
        <TiptapPreview artifactId={props.artifactId} yDoc={yDoc} />
      )}
      {artifactMeta.type === 'calendar' && (
        <ArtifactCalendar
          artifactId={props.artifactId}
          y={yDoc}
          centerDate={props.artifactDate}
          editable={false}
          viewType="fullsize"
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
