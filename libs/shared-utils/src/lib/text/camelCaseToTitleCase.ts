export const camelCaseToTitleCase = (titleCase: string) => {
  const result = titleCase.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};
