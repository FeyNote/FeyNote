import type { FilePurpose } from '@prisma/client';
import { FeynoteStreamWriter } from '../feynoteAPIStreamEncoding';
import { FeynoteAPIStreamMessageType } from '../FeynoteAPIStreamMessageType';

export class FileStreamEncoder {
  /**
   * Encode a file into a Uint8Array for network transmission.
   */
  async encode(data: {
    id: string;
    purpose: FilePurpose;
    artifactId?: string;
    fileName: string;
    mimetype: string;
    fileSize: number;
    file: File;
  }) {
    const writer = new FeynoteStreamWriter();

    // Type
    writer.writeUInt16(FeynoteAPIStreamMessageType.File);
    // Subtype (used for versioning in the future in the case of incompatible updates to this protocol)
    writer.writeUInt16(0);

    writer.writeJSON({
      id: data.id,
      purpose: data.purpose,
      artifactId: data.artifactId,
      fileName: data.fileName,
      mimetype: data.mimetype,
      fileSize: data.fileSize,
    });
    writer.writeRawUint8Array(new Uint8Array(await data.file.arrayBuffer()));

    return writer.encode();
  }
}
