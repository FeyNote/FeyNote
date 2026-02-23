import { Capability } from '@feynote/shared-utils';
import type { ModelMessage } from 'ai';

const MAX_MESSAGE_LIMIT_FREE = 5;
const MAX_MESSAGE_LIMIT_ENHANCED = 10;

function dropLeadingToolMessages(messages: ModelMessage[]): ModelMessage[] {
  const firstNonToolIndex = messages.findIndex((m) => m.role !== 'tool');
  if (firstNonToolIndex <= 0) return messages;
  return messages.slice(firstNonToolIndex);
}

export function limitChatContextByCapability(
  messages: ModelMessage[],
  capabilities: Set<Capability>,
): ModelMessage[] {
  const limit = capabilities.has(Capability.AssistantEnhancedMessageContext)
    ? MAX_MESSAGE_LIMIT_ENHANCED
    : MAX_MESSAGE_LIMIT_FREE;
  return dropLeadingToolMessages(messages.slice(-limit));
}
