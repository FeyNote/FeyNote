import { ArtifactDetail } from '@dnd-assistant/prisma';

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
