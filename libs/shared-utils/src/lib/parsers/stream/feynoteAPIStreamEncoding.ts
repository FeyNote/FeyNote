// ------------------------
//
// DO NOT USE THIS FILE DIRECTLY
//
// Instead, use the various format-specific encoders and decoders.
//
// ------------------------

/**
 * Please do not consume this class directly. Use it only via a type-specific encoder/decoder please.
 */
export class FeynoteStreamReader {
  private reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>;
  private leftover = new Uint8Array<ArrayBufferLike>(new ArrayBuffer(0));

  constructor(input: ReadableStream<Uint8Array>) {
    this.reader = input.getReader();
  }

  /**
   * Reads exactly `n` bytes from the stream (combining leftover and new chunks),
   * or throws if EOF is reached first.
   */
  private async readExactBytes(n: number): Promise<Uint8Array> {
    const result = new Uint8Array(n);
    let offset = 0;

    while (offset < n) {
      // If leftover is empty, read next chunk from the stream
      if (this.leftover.length === 0) {
        const { value, done } = await this.reader.read();
        if (done) {
          throw new Error(
            `Unexpected end of stream. Wanted ${n - offset} more bytes`,
          );
        }
        this.leftover = value;
      }

      const chunkSize = Math.min(this.leftover.length, n - offset);
      result.set(this.leftover.subarray(0, chunkSize), offset);
      this.leftover = this.leftover.subarray(chunkSize);
      offset += chunkSize;
    }

    return result;
  }

  /**
   * Reads a 16-bit unsigned integer (little-endian) from the stream.
   */
  async readUInt16(): Promise<number> {
    const bytes = await this.readExactBytes(2);
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
  async readUInt32(): Promise<number> {
    const bytes = await this.readExactBytes(4);
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
  async readString(): Promise<string> {
    const length = await this.readUInt16();
    if (length === 0) {
      return '';
    }
    const bytes = await this.readExactBytes(length);
    return new TextDecoder().decode(bytes);
  }

  /**
   * Reads JSON content in stringified form preceded by a 32-bit length.
   */
  async readJSON(): Promise<Record<string, unknown>> {
    const length = await this.readUInt32();
    if (length === 0) {
      return {};
    }
    const bytes = await this.readExactBytes(length);
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  }

  /**
   * Reads JSON content in stringified form preceded by a 32-bit length.
   */
  async readReadableStream(): Promise<{
    stream: ReadableStream<Uint8Array>;
    size: number;
  }> {
    const length = await this.readUInt32();

    let bytesRemaining = length;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const parentThis = this;

    const stream = new ReadableStream<Uint8Array>({
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
        if (parentThis.leftover.length > 0) {
          const chunkSize = Math.min(
            parentThis.leftover.length,
            bytesRemaining,
          );
          controller.enqueue(parentThis.leftover.subarray(0, chunkSize));
          parentThis.leftover = parentThis.leftover.subarray(chunkSize);
          bytesRemaining -= chunkSize;
          return;
        }

        // Else, read from the underlying stream
        const { value, done } = await parentThis.reader.read();
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
        parentThis.leftover = value.subarray(chunkSize);
      },
    });

    return {
      stream,
      size: length,
    };
  }
}

/**
 * Please do not consume this class directly. Use it only via a type-specific encoder/decoder please.
 */
export class FeynoteStreamWriter {
  private encoder = new TextEncoder();
  private parts: Uint8Array[] = [];

  writeUInt16(input: number) {
    const dv = new DataView(new ArrayBuffer(2));
    dv.setUint16(0, input, true /* little-endian */);

    this.parts.push(new Uint8Array(dv.buffer));
  }

  writeUInt32(input: number) {
    const dv = new DataView(new ArrayBuffer(4));
    dv.setUint32(0, input, true /* little-endian */);

    this.parts.push(new Uint8Array(dv.buffer));
  }

  /**
   * Useful for writing medium-length strings. Do not use for JSON.
   */
  writeString(string: string) {
    const encoded = this.encoder.encode(string);
    this.writeUInt16(encoded.length);
    this.parts.push(encoded);
  }

  /**
   * Intended for writing files or the like.
   */
  writeRawUint8Array(array: Uint8Array) {
    this.writeUInt32(array.length);
    this.parts.push(array);
  }

  writeJSON(json: Record<string, unknown>) {
    const stringified = JSON.stringify(json);
    const encoded = this.encoder.encode(stringified);
    this.writeUInt32(encoded.length);
    this.parts.push(encoded);
  }

  /**
   * Finalize the writer and encode as one contiguous Uint8Array
   */
  encode() {
    const totalSize = this.parts.reduce((sum, part) => sum + part.length, 0);
    const encoded = new Uint8Array(totalSize);
    let offset = 0;
    for (const part of this.parts) {
      encoded.set(part, offset);
      offset += part.length;
    }
    return encoded;
  }
}
