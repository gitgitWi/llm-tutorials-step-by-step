import type { LlmProviders } from '~/features/llm-providers/types';

export type CreateClientArgs = {
  apiKey: string;
  baseUrl?: string;
  provider?: LlmProviders;
};
