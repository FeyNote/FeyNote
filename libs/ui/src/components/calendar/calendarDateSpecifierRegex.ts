export const dateSpecifier = /(\d+)[-./\\](\d+)[-./\\](\d+)/;
export const dateSpecifierPartial = /(\d+)[-./\\]?(\d+)?[-./\\]?(\d+)?/;
export const daySpecifier = /#(\d+)/;

export const allowedDateSpecifiers = [dateSpecifier, daySpecifier];

export const isAllowedDateSpecifier = (text: string): boolean => {
  return allowedDateSpecifiers.some((specifier) => text.match(specifier));
};
