import { exec } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

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
  const format = new Promise<string>((res, rej) => {
    exec(`pandoc -o ${outputUrl} ${args.inputFilePath}`, (e) => {
      if (e) rej(e)
      res(outputUrl)
    })
  })
  return format
}
