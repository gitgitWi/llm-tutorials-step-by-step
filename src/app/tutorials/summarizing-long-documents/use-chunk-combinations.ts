import { useCallback, useState } from 'react';
import type { ChunkCombinationRequest } from './chunk-combination.types';
import { fetchChunkCombinations } from './fetch-chunk-combinations';
import { adjustModelName } from './request-tokenize';

type CombineChunkArgs = Omit<ChunkCombinationRequest, 'maxTokens'>;

const MAX_TOKENS_DEFAULT = 1_000;
const WINDOW_SIZE_DEFAULT = 50;

export const useCombiningChunks = () => {
  const [maxTokens, setMaxTokens] = useState(MAX_TOKENS_DEFAULT);
  const [windowSize, setWindowSize] = useState(WINDOW_SIZE_DEFAULT);

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

      const requestNums = Math.ceil(args.chunks.length / windowSize);
      const requestGroups = Array.from({ length: requestNums }, (_, i) => {
        const start = i * windowSize;
        return args.chunks.slice(start, start + windowSize);
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
    [maxTokens, windowSize]
  );

  return {
    maxTokens,
    setMaxTokens,
    windowSize,
    setWindowSize,
    combineChunks,
    combinedChunks,
    isPendingCombiningChunks,
    combinationProceed,
  };
};
