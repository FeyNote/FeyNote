import { logger } from '@feynote/api-services';
import { SupportedDocumentType } from './SupportedDocumentType';

export const splitDocumentName = (
  documentName: string,
): [SupportedDocumentType, string] => {
  const [type, identifier] = documentName.split(':');
  if (!type || !identifier) {
    logger.warn(`Missing type or identifier: ${documentName}`);
    throw new Error();
  }

  if (!Object.values(SupportedDocumentType).some((el) => el === type)) {
    logger.warn(`Unrecognized document type: ${type}`);
    throw new Error();
  }

  return [type as SupportedDocumentType, identifier];
};
