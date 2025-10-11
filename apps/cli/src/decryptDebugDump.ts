import { decryptWithRSAKey } from '@feynote/api-services';
import { readFile, writeFile } from 'fs/promises';

export const decryptDebugDump = async (args: {
  filename: string;
  outFilename: string;
}) => {
  if (!process.env.DEBUG_DUMP_PRIVATE_KEY) {
    throw new Error(
      "It looks like DEBUG_DUMP_PRIVATE_KEY isn't present. You'll need that to decrypt the dump",
    );
  }

  const encryptedJsonString = await readFile(args.filename, 'utf8');
  if (!encryptedJsonString) {
    throw new Error('It looks like the input json file does not exist');
  }

  const decryptedBlob = decryptWithRSAKey(
    encryptedJsonString,
    process.env.DEBUG_DUMP_PRIVATE_KEY,
  );

  const text = decryptedBlob.toString();

  await writeFile(args.outFilename, text);

  console.log('Done!');

  process.exit(0);
};
