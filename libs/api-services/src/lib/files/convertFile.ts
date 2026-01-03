import { exec } from 'child_process';
import { join, parse, basename } from 'path';

export enum FileFormat {
  Html = 'html',
  Org = 'org',
  Docx = 'docx',
  Markdown = 'markdown'
}

export async function convertFile(args: {
  inputFilePath: string,
  outputDir: string,
  inputFormat: FileFormat,
  outputFormat: FileFormat,
}): Promise<string> {
  const title = parse(basename(args.inputFilePath)).name;
  const outputUrl = join(args.outputDir, title);
  return new Promise<string>((res, rej) => {
    exec(
      `pandoc --preserve-tabs -f ${args.inputFormat} -t ${args.outputFormat} -o "${outputUrl}" "${args.inputFilePath}"`,
      (e) => {
        if (e) {
          rej(e);
        } else {
          res(outputUrl);
        }
      }
    );
  });
}
