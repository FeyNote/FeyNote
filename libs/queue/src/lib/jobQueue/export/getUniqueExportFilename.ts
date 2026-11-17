export const getUniqueExportFilename = (
  usedFilenames: Set<string>,
  title: string,
  extension: string,
): string => {
  let filename = `${title}.${extension}`;
  let counter = 2;
  while (usedFilenames.has(filename.toLowerCase())) {
    filename = `${title} (${counter}).${extension}`;
    counter++;
  }
  usedFilenames.add(filename.toLowerCase());
  return filename;
};
