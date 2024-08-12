import { StreamDelimiter, StreamReplacement } from '@feynote/shared-utils';
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionChunk,
  ChatCompletionMessageToolCall,
} from 'openai/resources';

interface ListenerArgumentMap {
  newAssistantMessage: void;
  newAssistantMessageContent: string;
  newToolCalls: ChatCompletionAssistantMessageParam;
  finish: void;
}

export class OpenAIStreamReader {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private listeners: {
    [T in keyof ListenerArgumentMap]: Set<
      (arg: ListenerArgumentMap[T]) => void
    >;
  } = {
    newAssistantMessage: new Set(),
    newAssistantMessageContent: new Set(),
    newToolCalls: new Set(),
    finish: new Set(),
  };
  private ongoingToolCalls: Record<number, ChatCompletionMessageToolCall> = {};

  constructor(reader: ReadableStreamDefaultReader<Uint8Array>) {
    this.reader = reader;
    this.stream();
  }

  on<T extends keyof ListenerArgumentMap>(
    eventName: T,
    callback: (args: ListenerArgumentMap[T]) => void,
  ) {
    this.listeners[eventName].add(callback);
  }

  off<T extends keyof ListenerArgumentMap>(
    eventName: T,
    callback: (args: ListenerArgumentMap[T]) => void,
  ) {
    this.listeners[eventName].delete(callback);
  }

  private triggerEventListeners<T extends keyof ListenerArgumentMap>(
    eventName: T,
    invokedArgument: ListenerArgumentMap[T],
  ) {
    const listeners = this.listeners[eventName];
    for (const listener of listeners) {
      listener(invokedArgument);
    }
  }

  private async stream() {
    const decoder = new TextDecoder('utf-8');
    const streaming = true;
    while (streaming) {
      const { value, done } = await this.reader.read();
      if (done) {
        this.triggerEventListeners('finish', undefined);
        return;
      }
      const decodedStr = decoder.decode(value, { stream: true });
      const jsonObjs: ChatCompletionChunk.Choice.Delta[] = decodedStr
        .split(StreamDelimiter)
        .filter((encodedStr) => encodedStr)
        .map((encodedStr) => {
          const revertedStr = encodedStr.replace(
            RegExp(StreamReplacement, 'g'),
            StreamDelimiter,
          );
          return JSON.parse(revertedStr);
        });
      jsonObjs.forEach((json) => {
        // New Tool Call started
        if (json.role === 'assistant' && json.tool_calls) {
          console.log('Started a new tool:', json.tool_calls);
          for (const toolCall of json.tool_calls) {
            // Doesn't have required properties ignore new tool call
            if (!toolCall.id || !toolCall.function?.name) return;
            this.ongoingToolCalls[toolCall.index] = {
              id: toolCall.id,
              type: 'function',
              function: { name: toolCall.function.name, arguments: '' },
            };
          }
        }
        // New Assistant Message
        else if (json.role === 'assistant' && !json.content) {
          this.triggerEventListeners('newAssistantMessage', undefined);
        }
        // Continue Existing Assistant Message
        else if (json.content) {
          this.triggerEventListeners(
            'newAssistantMessageContent',
            json.content,
          );
        }
        // Constructing Function Call
        else if (!json.role && json.tool_calls) {
          console.log('Recieving tool call info:', json.tool_calls);
          json.tool_calls.forEach((toolCall) => {
            const ongoingToolCall = this.ongoingToolCalls[toolCall.index];
            ongoingToolCall.function.arguments += toolCall.function?.arguments;
          });
        }
        // Empty blob signals end of tool calls
        else {
          const toolCalls = Object.values(this.ongoingToolCalls);
          if (toolCalls.length) {
            this.triggerEventListeners('newToolCalls', {
              role: 'assistant',
              tool_calls: toolCalls,
            });
            this.ongoingToolCalls = {};
          }
        }
      });
    }
  }
}
