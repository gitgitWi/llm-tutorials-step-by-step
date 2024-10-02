import { OpenAI, type ClientOptions } from 'openai';
import type { CreateClientArgs } from './types';

export const createOpenAiCompatibleClients = ({
  apiKey,
  baseUrl,
}: CreateClientArgs) => {
  const clientOptions: ClientOptions = { apiKey };
  if (baseUrl) Object.assign(clientOptions, { baseURL: baseUrl });

  return new OpenAI(clientOptions);
};
