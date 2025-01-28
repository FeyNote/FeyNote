import { parse } from 'path';

export const getPathWithoutExt = (path: string) => {
  return path.substring(0, path.length - parse(path).ext.length);
};
