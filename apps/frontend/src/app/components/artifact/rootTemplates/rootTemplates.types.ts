import { ArtifactEditorBlock } from '../../editor/blocknoteSchema';

type BlockBasedRootTemplate = {
  blocks: ArtifactEditorBlock[];
};

type StringBasedRootTemplate = {
  markdown: string;
};

export type RootTemplate = {
  id: string;
  title: string;
  rootTemplate: true;
} & (BlockBasedRootTemplate | StringBasedRootTemplate);
