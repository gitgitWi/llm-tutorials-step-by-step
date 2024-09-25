import { type TiktokenModel, encoding_for_model } from 'tiktoken';

export const getEncodedTokens = (text: string, modelName: TiktokenModel) => {
  const encoder = encoding_for_model(modelName);
  const tokens = encoder.encode(text);
  encoder.free();

  return tokens;
};
