import { getTreeFromYDoc } from './getTreeFromYDoc';

export const getAllUserIdsForTree = (
  tree: ReturnType<typeof getTreeFromYDoc>,
) => {
  const userIds = new Set<string>();
  for (const node of tree.yArray) {
    for (const [userId] of node.val.userAccess.entries()) {
      userIds.add(userId);
    }
  }

  return userIds;
};
