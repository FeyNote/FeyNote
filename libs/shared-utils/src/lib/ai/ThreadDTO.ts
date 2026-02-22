import type { FeynoteUIMessage } from './FeynoteUIMessage';

export type ThreadDTO = {
  id: string;
  title?: string;
  messages: ThreadDTOMessage[];
};

export type ThreadDTOMessage = FeynoteUIMessage & {
  updatedAt: Date;
};
