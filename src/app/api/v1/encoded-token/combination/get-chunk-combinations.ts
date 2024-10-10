import type { TiktokenModel } from 'js-tiktoken';
import type {
  ChunkCombinationRequest,
  CombinedChunk,
} from '~/app/tutorials/summarizing-long-documents/chunk-combination.types';
import { getEncodedTokens } from '~/features/tiktoken';

const delimiterSecondary = '.';

export const getChunkCombinations = ({
  chunks,
  maxTokens,
  modelName,
  delimiter,
}: ChunkCombinationRequest): CombinedChunk[] => {
  const originalChunksWithToken = chunks.map((chunk) => ({
    tokens: getEncodedTokens(chunk, modelName as TiktokenModel).length,
    chunk,
  }));

  const chunksWithTokenSplittedByMaxTokens = originalChunksWithToken.flatMap(
    ({ tokens, chunk }) => {
      if (tokens <= maxTokens) {
        return { tokens, chunk } as CombinedChunk;
      }

      const splitBySecondaryDelimiter = chunk.split(delimiterSecondary);
      const halfIndex = (splitBySecondaryDelimiter.length >> 1) - 1;
      const firstChunk = splitBySecondaryDelimiter.slice(0, halfIndex).join('');
      const lastChunk = splitBySecondaryDelimiter.slice(halfIndex).join('');

      return [
        {
          tokens: getEncodedTokens(firstChunk, modelName as TiktokenModel)
            .length,
          chunk: firstChunk,
        },
        {
          tokens: getEncodedTokens(lastChunk, modelName as TiktokenModel)
            .length,
          chunk: lastChunk,
        },
      ] as CombinedChunk[];
    }
  );

  const combinations: CombinedChunk[] =
    chunksWithTokenSplittedByMaxTokens.reduce((acc, { tokens, chunk }) => {
      const lastChunk = acc.pop() ?? { tokens: 0, chunk: '' };

      const extendedCandidateChunk = [lastChunk.chunk, chunk].join(delimiter);
      const extendedCandidateChunkTokens = getEncodedTokens(
        extendedCandidateChunk,
        modelName as TiktokenModel
      ).length;

      if (extendedCandidateChunkTokens > maxTokens) {
        acc.push(lastChunk);
        acc.push({ tokens, chunk });
        return acc;
      }

      acc.push({
        tokens: extendedCandidateChunkTokens,
        chunk: extendedCandidateChunk,
      });
      return acc;
    }, [] as CombinedChunk[]);

  return combinations;
};
