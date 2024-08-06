import { SupportedDocumentType } from './SupportedDocumentType';

export const splitDocumentName = (
  documentName: string,
): [SupportedDocumentType, string] => {
  const [type, identifier] = documentName.split(':');
  if (!type || !identifier) {
    console.error(`Missing type or identifier: ${documentName}`);
    throw new Error();
  }

  if (!Object.values(SupportedDocumentType).some((el) => el === type)) {
    console.error(`Unrecognized document type: ${type}`);
    throw new Error();
  }

  return [type as SupportedDocumentType, identifier];
};
