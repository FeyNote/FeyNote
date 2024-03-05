import { ArtifactDetail } from '@dnd-assistant/prisma/types';

interface Props {
  artifact: ArtifactDetail;
}

export const ArtifactRenderer = (props: Props) => {
  return (
    <>
      {props.artifact.fields.map((field) => (
        <div>{field.text}</div>
      ))}
    </>
  );
};
