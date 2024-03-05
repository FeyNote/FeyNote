export const routes = {
  home: route`/`,
  dashboard: route`/dashboard`,
  register: route`/register`,
  login: route`/login`,
  artifact: route`/artifact/${'id'}`,
};

/**
 * This function is intended to be used on a tagged template literal.
 * The template literal should be formatted such that any variable placeholder for the path (as required by React Router) should be inserted as a substitution string literal.
 *
 * # Example:
 * route\`/my/path/${'parameterName'}\`
 * produces a path of `/my/path/:parameterName`
 * and supplies a build function with signature:
 * ```
 *   build(args: {
 *     parameterName: string
 *   }): string
 * ```
 *
 * @returns An object with:
 *   - `path` usable by React Router as a route definition
 *   - `build` a method that takes an object with keys required to build the route, returning a string for use as an href
 */
function route<T>(
  pathParts: TemplateStringsArray,
  ...placeholders: (keyof T)[]
) {
  let path = '';
  for (let i = 0; i < pathParts.length; i++) {
    const pathPart = pathParts[i];
    const placeholder = String(placeholders[i] || '');
    path += pathPart + placeholder;
  }

  return {
    path,
    build: (
      args: typeof placeholders extends never[]
        ? void
        : { [key in keyof T]: string }
    ) => {
      let relativeUrl = '';
      for (let i = 0; i < pathParts.length; i++) {
        const pathPart = pathParts[i];
        const placeholder = placeholders[i];

        const _args = (args || {}) as Record<keyof T, string>; // Typecast necessary because args is a generic conditional that cannot be coerced even with a null check. This typecast is safe, however.
        const value = placeholder in _args ? _args[placeholders[i]] : '';
        relativeUrl += pathPart + value;
      }
      return relativeUrl;
    },
  };
}
