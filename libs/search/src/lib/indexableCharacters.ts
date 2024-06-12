const requiredCharacters = /\w/;

/**
 * Checks that the string has enough valid content we consider it
 * to contain enough text to be worthy of indexing it.
 *
 * At the moment, we only check whether it has at least one "word"
 * character -- I thought about enforcing a minimum length, but that might
 * be confusing to users. I kicked the can down the road on deciding that one,
 * but it's all in one place.
 */
export const isIndexable = (str: string) => {
  return !!str.match(requiredCharacters);
};
