import { YKeyValue } from 'y-utility/y-keyvalue';
import * as Sentry from '@sentry/react';

/**
 * Calculates a lexographic sort order between two uppercase strings.
 * The absolute values "A" and "Z" are used as the lower and upper bounds, but will not be returned as lexographic sort order.
 * You can use "A" and "Z" as the lower and upper bounds, respectively, when passing in arguments to place an item at the upper or lower bound.
 */
const _calculateOrderBetween = (a: string, b: string): string => {
  const aChar = a[0] || 'A';
  const aCharCode = a ? a.charCodeAt(0) : 'A'.charCodeAt(0);
  const bCharCode = b ? b.charCodeAt(0) : 'Z'.charCodeAt(0);

  if (bCharCode - aCharCode >= 2) {
    return String.fromCharCode(bCharCode - 1);
  }

  if (bCharCode - aCharCode === 1) {
    return aChar + _calculateOrderBetween(a.substring(1), '');
  }

  return aChar + _calculateOrderBetween(a.substring(1), b.substring(1));
};

const calculateOrderBetween = (a = 'A', b = 'Z'): string => {
  const validRegex = /^[A-Z]*$/;
  if (!validRegex.test(a) || !validRegex.test(b)) {
    console.error('a and b must be uppercase strings');
    Sentry.captureException(new Error('a and b must be uppercase strings'), {
      extra: {
        a,
        b,
      },
    });
    // We do not want to break the user's experience
    return 'Y';
  }

  if (a.localeCompare(b) > 0) {
    throw new Error('a must be greater than b');
  }

  return _calculateOrderBetween(a, b);
};

interface Args {
  treeYKV: YKeyValue<{
    parentNodeId: string | null;
    order: string;
  }>;
  parentNodeId: string | null;
  location:
    | {
        position: 'between';
        afterNodeId: string;
        beforeNodeId: string;
      }
    | {
        position: 'beginning';
      }
    | {
        position: 'end';
      };
}

export const calculateOrderForArtifactTreeNode = (args: Args): string => {
  const siblings = args.treeYKV.yarray
    .toArray()
    .filter((el) => {
      if (args.parentNodeId === null || args.parentNodeId === 'root') {
        // Something is at root if it has no parent node id OR it's parent isn't in the tree
        return (
          el.val.parentNodeId === null || !args.treeYKV.has(el.val.parentNodeId)
        );
      } else {
        return el.val.parentNodeId === args.parentNodeId;
      }
    })
    .sort((a, b) => a.val.order.localeCompare(b.val.order));

  const location = args.location;
  if (location.position === 'between') {
    const afterNode = siblings.find((el) => el.key === location.afterNodeId);
    const beforeNode = siblings.find((el) => el.key === location.beforeNodeId);

    return calculateOrderBetween(afterNode?.val.order, beforeNode?.val.order);
  }

  if (location.position === 'beginning') {
    return calculateOrderBetween('A', siblings.at(0)?.val.order || 'Z');
  }

  if (location.position === 'end') {
    return calculateOrderBetween(siblings.at(-1)?.val.order || 'A', 'Z');
  }

  throw new Error("Unsupported 'position' arg");
};
