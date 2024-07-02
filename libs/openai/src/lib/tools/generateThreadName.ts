import { getAssistantMessage } from '../getAssistantMessage';
import { SystemMessage } from './systemMessage';

export async function generateThreadName(
  query: string,
  threadId: string,
  userId: string,
): Promise<string | null> {
  const nameGenerationMessages = await getAssistantMessage(
    SystemMessage.NameGeneration,
    query,
    threadId,
    userId,
  );
  if (nameGenerationMessages.length) {
    // eslint-disable-next-line no-useless-escape
    const generatedTitles =
      nameGenerationMessages[0].content?.match(/(?<=\<)(.*?)(?=\>)/);
    if (generatedTitles?.length) {
      const parsedTitle = generatedTitles[0];
      return parsedTitle;
    }
  }
  return null;
}
