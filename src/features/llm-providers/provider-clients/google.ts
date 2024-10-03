import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { CreateClientArgs } from './types';

export const createGoogleClient = ({ apiKey }: CreateClientArgs) => {
  return createGoogleGenerativeAI({
    apiKey,
  });
};
