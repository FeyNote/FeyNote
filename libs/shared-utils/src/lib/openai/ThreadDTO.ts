import type { FeynoteUIMessage } from './FeynoteUIMessage';

export type ThreadDTO = {
  id: string;
  title?: string;
  messages: ThreadDTOMesssage[];
};

export type ThreadDTOMesssage = FeynoteUIMessage & {
  updatedAt: Date;
};
