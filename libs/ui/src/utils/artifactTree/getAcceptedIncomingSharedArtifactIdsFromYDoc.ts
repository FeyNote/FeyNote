import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc } from 'yjs';

const ACCEPTED_INCOMING_SHARED_ARTIFACT_IDS_KEY =
  'acceptedIncomingSharedArtifactIds';

export const getAcceptedIncomingSharedArtifactIdsFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: {
      accepted: true; // We need to have some content within the ykv
    };
  }>(ACCEPTED_INCOMING_SHARED_ARTIFACT_IDS_KEY);
  const yKeyValue = new YKeyValue<{
    accepted: true;
  }>(yArray);

  return yKeyValue;
};
