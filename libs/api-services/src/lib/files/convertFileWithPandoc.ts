import { exec } from 'child_process';
import { mkdtemp } from 'fs/promises';
import { join, parse, basename, normalize, sep } from 'path';

export enum FileFormat {
  Html = 'html',
  Org = 'org',
  Docx = 'docx',
  Markdown = 'markdown',
}

const FormatToExtensionMap = {
  [FileFormat.Html]: '.html',
  [FileFormat.Org]: '.org',
  [FileFormat.Docx]: '.docx',
  [FileFormat.Markdown]: '.md',
};

export async function convertFileWithPandoc(args: {
  inputFilePath: string;
  outputDir: string;
  inputFormat: FileFormat;
  outputFormat: FileFormat;
}): Promise<string> {
  const normalizedFilePath = normalize(args.inputFilePath);
  const title = parse(basename(normalizedFilePath)).name;
  // Adding a temp directory to the output of every converted file to ensure that are no file overwrites of files with the same title when processing files in bulk
  const tmpDir = await mkdtemp(join(args.outputDir, sep));
  const outputUrl = join(
    tmpDir,
    title + FormatToExtensionMap[args.outputFormat],
  );
  return new Promise<string>((res, rej) => {
    exec(
      `pandoc --sandbox=true --extract-media "${join(args.outputDir, title)}" --preserve-tabs -f "${args.inputFormat}" -t "${args.outputFormat}" -o "${outputUrl}" "${normalizedFilePath}"`,
      (e) => {
        if (e) {
          rej(e);
        } else {
          res(outputUrl);
        }
      },
    );
  });
}
