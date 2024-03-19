import { ArtifactDetail } from '@dnd-assistant/prisma/types';
import { ArtifactField } from './ArtifactField';
import { useMemo } from 'react';

interface Props {
  artifact: ArtifactDetail;
}

export const ArtifactRenderer = (props: Props) => {
  const fields = useMemo(
    () =>
      props.artifact.fields.sort(
        (a, b) => a.fieldTemplate.order - b.fieldTemplate.order
      ),
    [props.artifact.fields]
  );
  return (
    <>
      {fields.map((field) => (
        <ArtifactField field={field} key={field.id} />
      ))}
    </>
  );
};
