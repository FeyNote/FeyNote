import type { FilePurpose } from '@prisma/client';

const filePurposes = ['artifact'] satisfies FilePurpose[];

export interface DecodedFileStream {
  id: string;
  purpose: FilePurpose;
  artifactId?: string;
  fileName: string;
  mimetype: string;
  fileSize: number;
  fileContents: ReadableStream<Uint8Array>;
}

/*
 * Expects input in the form:
 *   1) [2 bytes: uint16] length of id, followed by `id` bytes
 *   2) [2 bytes: uint16] length of artifactId, followed by `artifactId` bytes
 *   3) [2 bytes: uint16] length of purpose, followed by `purpose` bytes
 *   4) [2 bytes: uint16] length of fileName, followed by `fileName` bytes
 *   5) [2 bytes: uint16] length of mimetype, followed by `mimetype` bytes
 *   6) [4 bytes: uint32] fileSize
 *   7) [fileSize bytes] file data
 *
 * Returns an object containing the parsed metadata and a ReadableStream for the file data.
 */
export async function decodeFileStream(
  input: ReadableStream<Uint8Array>,
): Promise<DecodedFileStream> {
  const reader = input.getReader();
  let leftover = new Uint8Array<ArrayBufferLike>(new ArrayBuffer(0));

  /**
   * Reads exactly `n` bytes from the stream (combining leftover and new chunks),
   * or throws if EOF is reached first.
   */
  async function readExactBytes(n: number): Promise<Uint8Array> {
    const result = new Uint8Array(n);
    let offset = 0;

    while (offset < n) {
      // If leftover is empty, read next chunk from the stream
      if (leftover.length === 0) {
        const { value, done } = await reader.read();
        if (done) {
          throw new Error(
            `Unexpected end of stream. Wanted ${n - offset} more bytes`,
          );
        }
        leftover = value;
      }

      const chunkSize = Math.min(leftover.length, n - offset);
      result.set(leftover.subarray(0, chunkSize), offset);
      leftover = leftover.subarray(chunkSize);
      offset += chunkSize;
    }

    return result;
  }

  /**
   * Reads a 16-bit unsigned integer (little-endian) from the stream.
   */
  async function readUInt16(): Promise<number> {
    const bytes = await readExactBytes(2);
    return new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    ).getUint16(
      0,
      true, // little-endian
    );
  }

  /**
   * Reads a 32-bit unsigned integer (little-endian) from the stream.
   */
  async function readUInt32(): Promise<number> {
    const bytes = await readExactBytes(4);
    return new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    ).getUint32(
      0,
      true, // little-endian
    );
  }

  /**
   * Reads a string preceded by a 16-bit length.
   */
  async function readString(): Promise<string> {
    const length = await readUInt16();
    if (length === 0) {
      return '';
    }
    const bytes = await readExactBytes(length);
    return new TextDecoder().decode(bytes);
  }

  const id = await readString();
  const artifactId = await readString(); // might be empty
  const purpose = await readString();
  const fileName = await readString();
  const mimetype = await readString();
  const fileSize = await readUInt32();

  let bytesRemaining = fileSize;

  const fileContents = new ReadableStream<Uint8Array>({
    /**
     * Whenever the consumer wants more data, we pull from leftover or
     * read new chunks. We only allow reading `fileSize` bytes total.
     */
    async pull(controller) {
      if (bytesRemaining <= 0) {
        // All file bytes were read, close the stream
        controller.close();
        return;
      }

      // If leftover has data, use that first
      if (leftover.length > 0) {
        const chunkSize = Math.min(leftover.length, bytesRemaining);
        controller.enqueue(leftover.subarray(0, chunkSize));
        leftover = leftover.subarray(chunkSize);
        bytesRemaining -= chunkSize;
        return;
      }

      // Else, read from the underlying stream
      const { value, done } = await reader.read();
      if (done) {
        // The stream ended before we read all file data
        // We close for now, but could throw an error here
        controller.close();
        return;
      }

      const chunkSize = Math.min(value.length, bytesRemaining);
      controller.enqueue(value.subarray(0, chunkSize));
      bytesRemaining -= chunkSize;

      // Any leftover from this chunk is stored for next pull
      leftover = value.subarray(chunkSize);
    },
  });

  // TODO: FIX THE ANY CAST AHHHH
  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (!filePurposes.includes(purpose as any)) {
    throw new Error(`Invalid file purpose: ${purpose}`);
  }

  return {
    id,
    // If artifactId is an empty string, convert it to undefined
    artifactId: artifactId || undefined,
    purpose: purpose as FilePurpose,
    fileName,
    mimetype,
    fileSize,
    fileContents,
  };
}

export const encodeFileStream = async (args: {
  id: string;
  artifactId?: string;
  purpose: FilePurpose;
  file: File;
}): Promise<Uint8Array<ArrayBuffer>> => {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];

  const encodeString = (str: string) => {
    const encoded = encoder.encode(str);
    // Use a DataView to explicitly write length in little-endian
    const dv = new DataView(new ArrayBuffer(2));
    dv.setUint16(0, encoded.length, true /* little-endian */);

    return [new Uint8Array(dv.buffer), encoded];
  };

  // 1) ID
  parts.push(...encodeString(args.id));
  // 2) artifactId (may be empty)
  parts.push(...encodeString(args.artifactId ?? ''));
  // 3) purpose
  parts.push(...encodeString(args.purpose));
  // 4) fileName
  parts.push(...encodeString(args.file.name));
  // 5) mimetype
  parts.push(...encodeString(args.file.type));

  // 6) fileSize (Uint32, little-endian)
  const fileBuffer = new Uint8Array(await args.file.arrayBuffer());
  const fileSizeView = new DataView(new ArrayBuffer(4));
  fileSizeView.setUint32(0, fileBuffer.length, true /* little-endian */);

  parts.push(new Uint8Array(fileSizeView.buffer));
  // 7) file data
  parts.push(fileBuffer);

  // Combine all parts
  const totalSize = parts.reduce((sum, part) => sum + part.length, 0);
  const payload = new Uint8Array(totalSize);
  let offset = 0;
  for (const part of parts) {
    payload.set(part, offset);
    offset += part.length;
  }

  return payload;
};

export async function readableStreamToUint8Array(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  let totalLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalLength += value.length;
    }
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
