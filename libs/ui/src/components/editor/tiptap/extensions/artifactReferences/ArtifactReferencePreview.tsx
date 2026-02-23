import styled from 'styled-components';
import { useMemo } from 'react';
import { Doc as YDoc, applyUpdate } from 'yjs';
import { useTranslation } from 'react-i18next';
import { StyledBoundedFloatingWindow } from '../../../../StyledBoundedFloatingWindow';
import { ReadonlyArtifactContent } from '../../../../artifact/ReadonlyArtifactContent';

export interface ReferencePreviewInfo {
  artifactYBin: Uint8Array | undefined;
  artifactInaccessible: boolean;
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

  const yDoc = useMemo(() => {
    const yDoc = new YDoc();

    if (props.previewInfo.artifactYBin) {
      applyUpdate(yDoc, props.previewInfo.artifactYBin);
    }

    return yDoc;
  }, [props.artifactId]);

  const previewContent = (
    <ReadonlyArtifactContent
      artifactId={props.artifactId}
      yDoc={yDoc}
      focusBlockId={props.artifactBlockId}
      focusDate={props.artifactDate}
    />
  );

  const inaccessibleMessage = (
    <>
      <Header>{t('referencePreview.inaccessible')}</Header>
      {t('referencePreview.inaccessible.message')}
    </>
  );

  return (
    <StyledBoundedFloatingWindow
      floatTarget={props.previewTarget}
      width={PREVIEW_WIDTH_PX}
      minHeight={PREVIEW_MIN_HEIGHT_PX}
      maxHeight={PREVIEW_MAX_HEIGHT_PX}
      onClick={(event) => props.onClick?.(event)}
    >
      {props.previewInfo.artifactInaccessible && inaccessibleMessage}
      {!props.previewInfo.artifactInaccessible && previewContent}
    </StyledBoundedFloatingWindow>
  );
};
