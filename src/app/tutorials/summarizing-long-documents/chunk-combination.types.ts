export type ChunkCombinationRequest = {
  chunks: string[];
  modelName: string;
  delimiter: string;
  maxTokens: number;
};

export type ChunkCombinationResponse = {
  combinedChunks: CombinedChunk[];
};

export type CombinedChunk = {
  tokens: number;
  chunk: string;
};
