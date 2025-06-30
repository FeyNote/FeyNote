import path from 'path';

class FilePathEscapeError extends Error {
  constructor() {
    super('FilePathEscapeError');
    this.name = 'FilePathEscapeError';
  }
}
/**
 * Normalizes a path provided by a user
 */
export function sanitizeFilePath(args: {
  mustStartWith: string;
  filePath: string;
}) {
  const resolvedPath = path.resolve(args.filePath);
  const normalizedPath = path.normalize(resolvedPath);

  if (!normalizedPath.startsWith(args.mustStartWith)) {
    throw new FilePathEscapeError();
  }

  return normalizedPath;
}
