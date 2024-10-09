import { default as fetcher } from 'ky';

type RequestTokenizeArgs = {
  text: string;
  modelName: string;
};

const TOKENIZE_API_URL = '/api/v1/encoded-token';

export const requestTokenize = async ({
  text,
  modelName,
}: RequestTokenizeArgs) => {
  return fetcher
    .post(TOKENIZE_API_URL, {
      json: {
        text,
        modelName: adjustModelName(modelName),
      },
      timeout: 600_000,
    })
    .json<{ tokens: Record<number, number> }>();
};

/** @todo create global constants for all models */
export const GPT_MODEL_NAMES = {
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4O: 'gpt-4o',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4: 'gpt-4',
  GPT_35_TURBO: 'gpt-3.5-turbo',
} as const;

export const adjustModelName = (modelName: string) => {
  if (modelName.startsWith(GPT_MODEL_NAMES.GPT_4O_MINI)) {
    return GPT_MODEL_NAMES.GPT_4O_MINI;
  }

  if (modelName.startsWith(GPT_MODEL_NAMES.GPT_4O)) {
    return GPT_MODEL_NAMES.GPT_4O;
  }

  if (modelName.startsWith(GPT_MODEL_NAMES.GPT_4_TURBO)) {
    return GPT_MODEL_NAMES.GPT_4_TURBO;
  }

  if (modelName.startsWith(GPT_MODEL_NAMES.GPT_4)) {
    return GPT_MODEL_NAMES.GPT_4;
  }

  return GPT_MODEL_NAMES.GPT_35_TURBO;
};
