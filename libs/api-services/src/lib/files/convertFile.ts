import { exec } from 'child_process';
import { join, parse, basename, normalize } from 'path';

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

export async function convertFile(args: {
  inputFilePath: string;
  outputDir: string;
  inputFormat: FileFormat;
  outputFormat: FileFormat;
}): Promise<string> {
  const normalizedFilePath = normalize(args.inputFilePath);
  const title = parse(basename(args.inputFilePath)).name;
  const outputUrl = join(
    args.outputDir,
    title + FormatToExtensionMap[args.outputFormat],
  );
  return new Promise<string>((res, rej) => {
    exec(
      `pandoc --preserve-tabs -f "${args.inputFormat}" -t "${args.outputFormat}" -o "${outputUrl}" "${normalizedFilePath}"`,
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
