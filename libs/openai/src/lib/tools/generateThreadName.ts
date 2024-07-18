import { generateAssistantResponse } from '../generateAssistantResponse';
import { OpenAIModel } from './openAIModels';
import { systemMessage } from './SystemMessage';

export async function generateThreadName(
  query: string,
  threadId: string,
): Promise<string | undefined | null> {
  const nameGenerationMessages = await generateAssistantResponse(
    systemMessage.nameGeneration,
    query,
    threadId,
    OpenAIModel.GPT4_MINI,
  );
  if (nameGenerationMessages.length) {
    const generatedTitle = nameGenerationMessages[0].content;
    return generatedTitle;
  }
  return null;
}
