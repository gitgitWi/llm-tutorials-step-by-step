import { match } from 'ts-pattern';
import { LlmProviders } from '~/features/llm-providers/types';
import { createAzureOpenAiClients } from './azure-openai';
import { createOpenAiCompatibleClients } from './openai-compatibles';
import type { CreateClientArgs } from './types';

const API_ENDPOINTS = {
  GROQ: 'https://api.groq.com/openai/v1',
} as const;

// TODO
const GOOGLE_VERTEXT_AI_CONSTANTS = {
  LOCATION: '',
  PROJECT_ID: '',
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
      const baseUrl = `https://${GOOGLE_VERTEXT_AI_CONSTANTS.LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${GOOGLE_VERTEXT_AI_CONSTANTS.PROJECT_ID}/locations/${GOOGLE_VERTEXT_AI_CONSTANTS.LOCATION}/endpoints/openapi`;
      return createOpenAiCompatibleClients({
        apiKey,
        baseUrl,
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
