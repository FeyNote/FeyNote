export interface LogseqBlock {
  id: string;
  content: string;
  format: 'markdown' | 'org';
  children: LogseqBlock[];
  properties: Record<string, string> | null;
}

export interface LogseqPage {
  id: string;
  'page-name': string;
  children: LogseqBlock[];
  properties: LogseqPageProperties | null;
}

interface LogseqPageProperties {
  'ls-type'?: 'whiteboard-page';
  icon?: string;
  'logseq.tldraw.page'?: {
    id: string;
    name: string;
    bindings: Record<string, string>;
    nonce: number;
    assets: [
      {
        id: string;
        type: 'image'; // TODO: Verify typings when implementing TLDRAW https://github.com/FeyNote/FeyNote/issues/845
        src: string;
        size: number[];
      },
    ];
    'shapes-index': string[];
  };
}

export interface LogseqGraph {
  version: number;
  blocks: LogseqPage[];
}
