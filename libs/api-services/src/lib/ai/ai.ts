import { globalServerConfig } from '@feynote/config';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createGateway } from 'ai';

export const aiProvider = (() => {
  const commonConfig = {
    apiKey: globalServerConfig.ai.apiKey,
  };
  const provider = globalServerConfig.ai.provider;
  switch (provider) {
    case 'openrouter': {
      return createOpenRouter(commonConfig);
    }
    case 'openai': {
      return createOpenAI(commonConfig);
    }
    case 'anthropic': {
      return createAnthropic(commonConfig);
    }
    case 'vercel': {
      return createGateway(commonConfig);
    }
    default: {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
})();

export const aiProviderNativeTools = (() => {
  const provider = globalServerConfig.ai.provider;
  switch (provider) {
    case 'openrouter': {
      return {
        web_search: undefined,
      };
    }
    case 'openai': {
      return {
        web_search: openai.tools.webSearch({
          searchContextSize: 'high',
        }),
      } as const;
    }
    case 'anthropic': {
      return {
        web_search: anthropic.tools.webSearch_20250305({
          maxUses: 3,
        }),
      } as const;
    }
    case 'vercel': {
      return {
        web_search: undefined,
      } as const;
    }
    default: {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
})();
