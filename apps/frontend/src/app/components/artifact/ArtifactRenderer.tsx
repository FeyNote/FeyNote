import { ArtifactDetail } from '@dnd-assistant/prisma/types';
import { ArtifactField } from './ArtifactField';

interface Props {
  artifact: ArtifactDetail;
}

export const ArtifactRenderer = (props: Props) => {
  return (
    <>
      {props.artifact.fields.map((field, idx) => (
        <ArtifactField field={field} key={field.id} />
      ))}
    </>
  );
};
