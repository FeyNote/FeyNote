import { ArtifactField, FieldType } from '@prisma/client';
import { z } from 'zod';

export const ArtifactFieldInputSchema = z.object({
  id: z.string(),
  imageIds: z.array(z.string()).optional(),
  text: z.string().optional(),
  title: z.string().optional(),
  order: z.number().optional(),
  aiPrompt: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  type: z.nativeEnum(FieldType).optional(),
});

export type ArtifactFieldInputType = z.infer<typeof ArtifactFieldInputSchema>;

export type ArtifactFieldData = Omit<
  ArtifactField,
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'imageIds'
  | 'fieldTemplateId'
  | 'artifactId'
>;

export type ArtifactFieldDataKey = keyof ArtifactFieldData;
