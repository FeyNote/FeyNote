import type { ImportFormat } from '@feynote/prisma/types';
import { FeynoteStreamReader } from '../feynoteAPIStreamEncoding';
import { FeynoteAPIStreamMessageType } from '../FeynoteAPIStreamMessageType';

export interface ImportJobStream {
  id: string;
  fileName: string;
  mimetype: string;
  format: ImportFormat;
  fileSize: number;
  fileContents: ReadableStream<Uint8Array>;
}

/**
 * Converts a ReadableStream to a decoded file.
 * ALL OUTPUTS MUST BE ZOD-CHECKED FOR ACCURACY. TREAT AS UNVALIDATED USER INPUT.
 */
export class ImportJobStreamDecoder {
  private streamReader: FeynoteStreamReader;

  constructor(input: ReadableStream<Uint8Array>) {
    this.streamReader = new FeynoteStreamReader(input);
  }

  async decode() {
    const messageType = await this.streamReader.readUInt16();

    if (messageType !== FeynoteAPIStreamMessageType.Job) {
      throw new Error(
        `Stream is of wrong type for this decoder. Expected ${FeynoteAPIStreamMessageType.Job}, received: ${messageType}`,
      );
    }

    // Subtype will be used for versioning in the future in the case of incompatible updates to this protocol.
    const messageSubType = await this.streamReader.readUInt16();

    switch (messageSubType) {
      case 0: {
        return this.decodeV0();
      }
      default: {
        throw new Error(
          `Unsupported file stream subtype. Expected 0, received: ${messageSubType}`,
        );
      }
    }
  }

  private async decodeV0() {
    const data = await this.streamReader.readJSON();
    const fileStream = await this.streamReader.readReadableStream();

    return {
      id: data['id'],
      fileName: data['fileName'],
      mimetype: data['mimetype'],
      format: data['format'],
      fileSize: fileStream.size,
      fileContents: fileStream.stream,
    } as ImportJobStream;
  }
}
