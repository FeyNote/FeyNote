import { Prisma } from '@prisma/client';

export interface ArtifactTemplateData {
  data: Omit<Prisma.ArtifactTemplateUncheckedCreateInput, 'userId'>;
}
