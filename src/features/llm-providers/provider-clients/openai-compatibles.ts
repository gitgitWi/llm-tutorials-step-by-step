import { type OpenAIProviderSettings, createOpenAI } from '@ai-sdk/openai';
import { LlmProviders } from '~/features/llm-providers/types';
import type { CreateClientArgs } from './types';

export const createOpenAiCompatibleClients = ({
  apiKey,
  baseUrl,
  provider,
}: CreateClientArgs) => {
  const options: OpenAIProviderSettings = {
    apiKey,
    compatibility: provider === LlmProviders.OPENAI ? 'strict' : 'compatible',
  };

  if (baseUrl) {
    Object.assign(options, { baseURL: baseUrl } as OpenAIProviderSettings);
  }

  return createOpenAI(options);
};
