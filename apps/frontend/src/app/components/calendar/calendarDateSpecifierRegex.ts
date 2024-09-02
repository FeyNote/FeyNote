export const dashDelimitedDateSpecifier = /\d+-\d+-\d+/;
export const periodDelimitedDateSpecifier = /\d+\.\d+\.\d+/;
export const slashDelimitedDateSpecifier = /\d+\/\d+\/\d+/;
export const poundDaySpecifier = /#\d+/;

export const allowedDateSpecifiers = [
  dashDelimitedDateSpecifier,
  periodDelimitedDateSpecifier,
  slashDelimitedDateSpecifier,
  poundDaySpecifier,
];

export const isAllowedDateSpecifier = (text: string): boolean => {
  return allowedDateSpecifiers.some((specifier) => text.match(specifier));
};
