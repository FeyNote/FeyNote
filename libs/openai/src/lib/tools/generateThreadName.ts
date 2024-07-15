import { generateAssistantResponse } from '../generateAssistantResponse';
import { systemMessage } from './SystemMessage';

export async function generateThreadName(
  query: string,
  threadId: string,
): Promise<string | undefined | null> {
  const nameGenerationMessages = await generateAssistantResponse(
    systemMessage.nameGeneration,
    query,
    threadId,
  );
  if (nameGenerationMessages.length) {
    const generatedTitle = nameGenerationMessages[0].content;
    return generatedTitle;
  }
  return null;
}
