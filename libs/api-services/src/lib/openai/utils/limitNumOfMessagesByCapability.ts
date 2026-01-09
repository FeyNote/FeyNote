import { Capability } from '@feynote/shared-utils';
import type { ModelMessage } from 'ai';

const MAX_MESSAGE_LIMIT = 10;
export function limitNumOfMessagesByCapability(
  messages: ModelMessage[],
  capabilities: Set<Capability>,
): ModelMessage[] {
  if (capabilities.has(Capability.AssistantEnhancedMessageContext)) {
    return messages.slice(-MAX_MESSAGE_LIMIT);
  }
  return messages.slice(-MAX_MESSAGE_LIMIT / 2);
}
