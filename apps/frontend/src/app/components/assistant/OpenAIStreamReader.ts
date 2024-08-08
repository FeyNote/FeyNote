import type { ChatCompletionAssistantMessageParam } from 'openai/resources';

interface ListenerArgumentMap {
  newAssistantMessage: void;
  newAssistantMessageContent: string;
  newToolCall: ChatCompletionAssistantMessageParam;
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
    newToolCall: new Set(),
    finish: new Set(),
  };

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
      console.log(value);
      if (done) {
        this.triggerEventListeners('finish', undefined);
        return;
      }
      const text = decoder.decode(value, { stream: true });
    }
  }
}
