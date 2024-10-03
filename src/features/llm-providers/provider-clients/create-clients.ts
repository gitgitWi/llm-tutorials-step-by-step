import { match } from 'ts-pattern';
import { LlmProviders } from '~/features/llm-providers/types';
import { createAzureOpenAiClients } from './azure-openai';
import { createGoogleClient } from './google';
import { createOpenAiCompatibleClients } from './openai-compatibles';
import type { CreateClientArgs } from './types';

const API_ENDPOINTS = {
  GROQ: 'https://api.groq.com/openai/v1',
} as const;

export const createClient = ({ provider, apiKey }: CreateClientArgs) => {
  return match({ provider })
    .with({ provider: LlmProviders.AZURE_OPENAI }, () => {
      return createAzureOpenAiClients({
        apiKey,
      });
    })
    .with({ provider: LlmProviders.GROQ }, () => {
      return createOpenAiCompatibleClients({
        provider: LlmProviders.GROQ,
        baseUrl: API_ENDPOINTS.GROQ,
        apiKey,
      });
    })
    .with({ provider: LlmProviders.OPENAI }, () => {
      return createOpenAiCompatibleClients({
        provider: LlmProviders.OPENAI,
        apiKey,
      });
    })
    .with({ provider: LlmProviders.GOOGLE_AI }, () => {
      return createGoogleClient({
        apiKey,
      });
    })
    .with({ provider: LlmProviders.ANTHROPIC }, () => {
      // TODO
      return;
    })
    .otherwise(() => {
      throw new Error('[createClient] Invalid ProviderName');
    });
};
