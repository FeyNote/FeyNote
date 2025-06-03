import type { FilePurpose } from '@prisma/client';
import { FeynoteStreamReader } from '../feynoteAPIStreamEncoding';
import { FeynoteAPIStreamMessageType } from '../FeynoteAPIStreamMessageType';

export interface DecodedFileStream {
  id: string;
  purpose: FilePurpose;
  artifactId?: string;
  fileName: string;
  mimetype: string;
  fileSize: number;
  fileContents: ReadableStream<Uint8Array>;
}

/**
 * Converts a ReadableStream to a decoded file.
 * ALL OUTPUTS MUST BE ZOD-CHECKED FOR ACCURACY. TREAT AS UNVALIDATED USER INPUT.
 */
export class FileStreamDecoder {
  private streamReader: FeynoteStreamReader;

  constructor(input: ReadableStream<Uint8Array>) {
    this.streamReader = new FeynoteStreamReader(input);
  }

  async decode() {
    const messageType = await this.streamReader.readUInt16();

    if (messageType !== FeynoteAPIStreamMessageType.File) {
      throw new Error(
        `Stream is of wrong type for this decoder. Expected ${FeynoteAPIStreamMessageType.File}, received: ${messageType}`,
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
      artifactId: data['artifactId'],
      purpose: data['purpose'],
      fileName: data['fileName'],
      mimetype: data['mimetype'],
      fileSize: fileStream.size,
      fileContents: fileStream.stream,
    } as DecodedFileStream;
  }
}
