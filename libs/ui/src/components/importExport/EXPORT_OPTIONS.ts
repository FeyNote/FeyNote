import type { ExportFormat } from '@feynote/prisma/types';
import { AiFillFileMarkdown, BsFiletypeJson } from '../AppIcons';

export const EXPORT_OPTIONS: {
  component: React.FC;
  title: string;
  description: string;
  format: ExportFormat;
}[] = [
  {
    component: BsFiletypeJson,
    title: 'export.options.json',
    description: 'export.options.json.description',
    format: 'json',
  },
  {
    component: AiFillFileMarkdown,
    title: 'export.options.markdown',
    description: 'export.options.markdown.description',
    format: 'markdown',
  },
];
