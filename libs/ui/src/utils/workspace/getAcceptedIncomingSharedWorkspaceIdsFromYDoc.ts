import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc } from 'yjs';

const ACCEPTED_INCOMING_SHARED_WORKSPACE_IDS_KEY =
  'acceptedIncomingSharedWorkspaceIds';

export const getAcceptedIncomingSharedWorkspaceIdsFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: {
      accepted: true;
    };
  }>(ACCEPTED_INCOMING_SHARED_WORKSPACE_IDS_KEY);
  const yKeyValue = new YKeyValue<{
    accepted: true;
  }>(yArray);

  return yKeyValue;
};
