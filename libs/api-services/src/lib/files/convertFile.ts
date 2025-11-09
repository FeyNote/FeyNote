import { exec } from 'child_process';
import { tmpdir } from 'os';
import { join, parse } from 'path';

export enum FileFormat {
  Html = 'html',
  Org = 'org',
  Docx = 'docx',
  Markdown = 'markdown'
}

export async function convertFile(args: {
  inputFilePath: string,
  inputFormat: FileFormat,
  outputFormat: FileFormat,
}): Promise<string> {
  const tempDir = tmpdir();
  const outputUrl = join(tempDir, `${Date.now()}-${crypto.randomUUID()}`);
  const title = parse(basename).name;
  return new Promise<string>((res, rej) => {
    exec(
      `pandoc -f ${args.inputFormat} -t ${args.outputFormat} -o "${outputUrl}" "${args.inputFilePath}"`,
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
