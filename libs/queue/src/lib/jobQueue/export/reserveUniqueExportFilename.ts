export const reserveUniqueExportFilename = (
  usedFilenames: Set<string>,
  sanitizedTitle: string,
  extension: string,
): string => {
  let filename = `${sanitizedTitle}.${extension}`;
  let counter = 2;
  while (usedFilenames.has(filename.toLowerCase())) {
    filename = `${sanitizedTitle} (${counter}).${extension}`;
    counter++;
  }
  usedFilenames.add(filename.toLowerCase());
  return filename;
};
