export interface LogseqBlock {
  id: string,
  content: string,
  format: 'markdown' | 'org',
  children: LogseqBlock[],
}

export interface LogseqPage {
  id: string,
  'page-name': string,
  children: LogseqBlock[],
}

export interface LogseqGraph {
  version: number,
  blocks: LogseqPage[],
}
