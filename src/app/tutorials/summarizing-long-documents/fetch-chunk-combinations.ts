import { default as fetcher } from 'ky';
import type {
  ChunkCombinationRequest,
  ChunkCombinationResponse,
} from './chunk-combination.types';

export const fetchChunkCombinations = async (args: ChunkCombinationRequest) => {
  return fetcher
    .post<ChunkCombinationResponse>('/api/v1/encoded-token/combination', {
      json: {
        chunks: args.chunks,
        modelName: args.modelName,
        delimiter: args.delimiter,
        maxTokens: args.maxTokens,
      } as ChunkCombinationRequest,
      timeout: 60_000,
    })
    .json();
};
