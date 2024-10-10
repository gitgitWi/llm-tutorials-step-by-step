import { useCallback, useState } from 'react';
import type { ChunkCombinationRequest } from './chunk-combination.types';
import { fetchChunkCombinations } from './fetch-chunk-combinations';
import { adjustModelName } from './request-tokenize';

type CombineChunkArgs = Omit<ChunkCombinationRequest, 'maxTokens'>;

const MAX_TOKENS_DEFAULT = 1_000;
export const GROUP_SIZE = 50;

export const useCombiningChunks = () => {
  const [maxTokens, setMaxTokens] = useState(MAX_TOKENS_DEFAULT);
  const [combinedChunks, setCombinedChunks] = useState<
    { tokens: number; chunk: string }[]
  >([]);
  const [isPendingCombiningChunks, setIsPendingCombiningChunks] =
    useState(false);
  const [combinationProceed, setCombinationProceed] = useState(0);

  const combineChunks = useCallback(
    async (args: CombineChunkArgs) => {
      const modelAdjusted = adjustModelName(args.modelName ?? '');
      const delimiterAdjusted =
        args.delimiter === '\\n' ? '\n' : args.delimiter;

      setCombinationProceed(0);
      setIsPendingCombiningChunks(true);
      setCombinedChunks([]);

      const requestNums = Math.ceil(args.chunks.length / GROUP_SIZE);
      const requestGroups = Array.from({ length: requestNums }, (_, i) => {
        const start = i * GROUP_SIZE;
        return args.chunks.slice(start, start + GROUP_SIZE);
      });

      try {
        for await (const group of requestGroups) {
          const { combinedChunks } = await fetchChunkCombinations({
            chunks: group,
            modelName: modelAdjusted,
            maxTokens,
            delimiter: delimiterAdjusted,
          });
          setCombinedChunks((prev) => prev.concat(combinedChunks));
          setCombinationProceed((prev) => prev + 1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsPendingCombiningChunks(false);
      }
    },
    [maxTokens]
  );

  return {
    combineChunks,
    combinedChunks,
    isPendingCombiningChunks,
    maxTokens,
    setMaxTokens,
    combinationProceed,
  };
};
