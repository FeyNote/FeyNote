import { ArtifactDetail } from '@dnd-assistant/prisma/types';
import { ArtifactField } from './ArtifactField';
import { useMemo } from 'react';

interface Props {
  artifact: ArtifactDetail;
}

export const ArtifactRenderer = (props: Props) => {
  const fields = useMemo(
    () => props.artifact.artifactFields.sort((a, b) => a.order - b.order),
    [props.artifact.artifactFields]
  );
  return (
    <>
      {fields.map((field) => (
        <ArtifactField field={field} key={field.id} />
      ))}
    </>
  );
};
