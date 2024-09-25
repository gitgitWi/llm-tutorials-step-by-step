import { type TiktokenModel, encodingForModel } from 'js-tiktoken';

export const getEncodedTokens = (text: string, modelName: TiktokenModel) => {
  const encoder = encodingForModel(modelName);
  const tokens = encoder.encode(text);
  return tokens;
};
