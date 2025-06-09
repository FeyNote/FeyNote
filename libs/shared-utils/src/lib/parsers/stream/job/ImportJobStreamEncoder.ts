import { ImportFormat } from '@feynote/prisma/types';
import { FeynoteStreamWriter } from '../feynoteAPIStreamEncoding';
import { FeynoteAPIStreamMessageType } from '../FeynoteAPIStreamMessageType';

export class ImportJobStreamEncoder {
  /**
   * Encode a file into a Uint8Array for network transmission.
   */
  async encode(data: {
    id: string;
    fileName: string;
    mimetype: string;
    format: ImportFormat;
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
      fileName: data.fileName,
      mimetype: data.mimetype,
      format: ImportFormat,
      fileSize: data.fileSize,
    });
    writer.writeRawUint8Array(new Uint8Array(await data.file.arrayBuffer()));

    return writer.encode();
  }
}
