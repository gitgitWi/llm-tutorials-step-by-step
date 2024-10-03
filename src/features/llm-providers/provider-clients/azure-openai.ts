import { createAzure } from '@ai-sdk/azure';
import type { CreateClientArgs } from './types';

const API_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';

export const createAzureOpenAiClients = ({
  apiKey,
  baseUrl,
}: CreateClientArgs) => {
  return createAzure({
    apiKey,
    baseURL: baseUrl || API_ENDPOINT,
  });
};
