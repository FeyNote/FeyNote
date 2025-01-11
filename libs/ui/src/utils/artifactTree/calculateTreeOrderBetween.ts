import * as Sentry from '@sentry/react';

/**
 * Calculates a lexographic sort order between two uppercase strings.
 * The absolute values "A" and "Z" are used as the lower and upper bounds, but will not be returned as lexographic sort order.
 * You can use "A" and "Z" as the lower and upper bounds, respectively, when passing in arguments to place an item at the upper or lower bound.
 */
const _calculateTreeOrderBetween = (a: string, b: string): string => {
  const aChar = a[0] || 'A';
  const aCharCode = a ? a.charCodeAt(0) : 'A'.charCodeAt(0);
  const bCharCode = b ? b.charCodeAt(0) : 'Z'.charCodeAt(0);

  if (bCharCode - aCharCode >= 2) {
    return String.fromCharCode(bCharCode - 1);
  }

  if (bCharCode - aCharCode === 1) {
    return aChar + _calculateTreeOrderBetween(a.substring(1), '');
  }

  return aChar + _calculateTreeOrderBetween(a.substring(1), b.substring(1));
};

export const calculateTreeOrderBetween = (a = 'A', b = 'Z'): string => {
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

  return _calculateTreeOrderBetween(a, b);
};
