import { AzureOpenAI } from 'openai';
import type { CreateClientArgs } from './types';

const API_VERSION = '2024-02-15-preview';
const API_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const MODEL = 'gpt-4o';

export const createAzureOpenAiClients = ({ apiKey }: CreateClientArgs) => {
  return new AzureOpenAI({
    apiKey,
    apiVersion: API_VERSION,
    endpoint: API_ENDPOINT,
    deployment: MODEL,
  });
};
