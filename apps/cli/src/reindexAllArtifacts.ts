import { prisma } from '@feynote/prisma/client';
import { applyUpdate, Doc as YDoc } from 'yjs';
import { searchProvider } from '@feynote/search';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';

const DEFAULT_PAGE_SIZE = 1000;

export const reindexAllArtifacts = async (
  throwOnError: boolean,
  pageSize = DEFAULT_PAGE_SIZE,
) => {
  for (let page = 0; ; page++) {
    console.log('Indexing page', page);

    const artifacts = await prisma.artifact.findMany({
      take: pageSize,
      skip: page * pageSize,
      select: {
        id: true,
        userId: true,
        artifactShares: {
          select: {
            userId: true,
          },
        },
        yBin: true,
      },
    });

    for (const artifact of artifacts) {
      try {
        const oldYjsDoc = new YDoc();
        const newYjsDoc = new YDoc();
        applyUpdate(newYjsDoc, artifact.yBin);

        const oldJSONContent = getTiptapContentFromYjsDoc(
          oldYjsDoc,
          ARTIFACT_TIPTAP_BODY_KEY,
        );
        const newJSONContent = getTiptapContentFromYjsDoc(
          newYjsDoc,
          ARTIFACT_TIPTAP_BODY_KEY,
        );
        const newTitle = newYjsDoc
          .getMap(ARTIFACT_META_KEY)
          .get('title') as string;

        const indexableArtifact = {
          id: artifact.id,
          userId: artifact.userId,
          oldState: {
            title: '',
            readableUserIds: [],
            text: '',
            jsonContent: oldJSONContent,
          },
          newState: {
            title: newTitle,
            readableUserIds: [
              artifact.userId,
              ...artifact.artifactShares.map((share) => share.userId),
            ],
            text: getTextForJSONContent(newJSONContent),
            jsonContent: newJSONContent,
          },
        };

        await searchProvider.indexArtifact(indexableArtifact);
      } catch (e) {
        if (throwOnError) {
          throw e;
        } else {
          console.error(e);
        }
      }
    }
  }
};
