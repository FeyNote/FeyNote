// import { ArtifactEditorBlock } from '@feynote/blocknote';
// import { getBlocksById } from './getJsonContentById';
// import { getTextForJsonContent } from './getTextForJsonContent';
//
// // eslint-disable-next-line @typescript-eslint/no-namespace
// export namespace BlocksDiff {
//   export type Added = {
//     id: string;
//     status: 'added';
//     oldBlock: undefined;
//     newBlock: ArtifactEditorBlock;
//     referenceText: string;
//   };
//   export type Deleted = {
//     id: string;
//     status: 'deleted';
//     oldBlock: ArtifactEditorBlock;
//     newBlock: undefined;
//     referenceText: string;
//   };
//   export type Updated = {
//     id: string;
//     status: 'updated';
//     oldBlock: ArtifactEditorBlock;
//     newBlock: ArtifactEditorBlock;
//     referenceText: string;
//   };
//
//   export type ResultEntry = Added | Deleted | Updated;
//
//   export type Result = Map<string, ResultEntry>;
// }
//
// export function getBlocksDiff(
//   oldBlockTree: ArtifactEditorBlock[],
//   newBlockTree: ArtifactEditorBlock[],
// ): BlocksDiff.Result {
//   const oldBlocksById = getBlocksById(oldBlockTree);
//   const newBlocksById = getBlocksById(newBlockTree);
//
//   // Fetch flat list of blocks, rather than tree which is what this function is called with
//   const oldBlocks = Object.values(oldBlocksById);
//   const newBlocks = Object.values(newBlocksById);
//
//   const results: BlocksDiff.Result = new Map();
//
//   for (const newBlock of newBlocks) {
//     if (oldBlocksById[newBlock.id]) {
//       const oldText = getTextForBlock(oldBlocksById[newBlock.id]);
//       const newText = getTextForBlock(newBlock);
//
//       if (oldText !== newText) {
//         results.set(newBlock.id, {
//           id: newBlock.id,
//           status: 'updated',
//           oldBlock: oldBlocksById[newBlock.id],
//           newBlock,
//           referenceText: newText,
//         });
//       }
//     } else {
//       const newText = getTextForBlock(newBlock);
//
//       results.set(newBlock.id, {
//         id: newBlock.id,
//         status: 'added',
//         oldBlock: undefined,
//         newBlock,
//         referenceText: newText,
//       });
//     }
//   }
//
//   for (const oldBlock of oldBlocks) {
//     if (!newBlocksById[oldBlock.id]) {
//       const oldText = getTextForBlock(oldBlock);
//
//       results.set(oldBlock.id, {
//         id: oldBlock.id,
//         status: 'deleted',
//         oldBlock,
//         newBlock: undefined,
//         referenceText: oldText,
//       });
//     }
//   }
//
//   return results;
// }
