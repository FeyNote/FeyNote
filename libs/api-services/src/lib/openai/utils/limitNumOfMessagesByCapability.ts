import { Capability } from '@feynote/shared-utils';
import type { CoreMessage } from 'ai';

const MAX_MESSAGE_LIMIT = 10;
export function limitNumOfMessagesByCapability(
  messages: CoreMessage[],
  capabilities: Set<Capability>,
): CoreMessage[] {
  if (capabilities.has(Capability.AssistantEnhancedMessageHistory)) {
    return messages.slice(-MAX_MESSAGE_LIMIT);
  }
  return messages.slice(-MAX_MESSAGE_LIMIT / 2);
}
