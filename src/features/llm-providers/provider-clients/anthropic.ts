import { createAnthropic } from '@ai-sdk/anthropic';
import type { CreateClientArgs } from './types';

export const createAnthropicClient = ({ apiKey }: CreateClientArgs) => {
  return createAnthropic({
    apiKey,
  });
};
