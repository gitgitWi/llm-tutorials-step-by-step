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
        modelName,
      },
      timeout: 60_000,
    })
    .json<{ tokens: Record<number, number> }>();
};
