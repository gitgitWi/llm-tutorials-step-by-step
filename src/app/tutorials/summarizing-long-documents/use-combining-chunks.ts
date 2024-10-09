import { useCallback, useState } from 'react';
import {
  GPT_MODEL_NAMES,
  adjustModelName,
  requestTokenize,
} from './request-tokenize';

type CombineChunksArgs = {
  chunks: string[];
  delimiter: string;
  maxTokens?: number;
  modelName?: string;
};

export const useCombiningChunks = () => {
  const [maxTokens, setMaxTokens] = useState(500);
  const [combinedChunks, setCombinedChunks] = useState<
    { tokens: number; chunk: string }[]
  >([]);
  const [isPendingCombiningChunks, setIsPendingCombiningChunks] =
    useState(false);

  const combineChunks = useCallback(
    async (args: CombineChunksArgs) => {
      setIsPendingCombiningChunks(true);

      _combineChunks(Object.assign({}, args, { maxTokens }))
        .then(({ tokensOfChunks, combinedChunks }) => {
          setCombinedChunks(tokensOfChunks);
        })
        .finally(() => {
          setIsPendingCombiningChunks(false);
        });
    },
    [maxTokens]
  );

  return {
    combineChunks,
    combinedChunks,
    isPendingCombiningChunks,
    setMaxTokens,
  };
};

const delimiterSecondary = '.';

const _combineChunks = async ({
  chunks,
  delimiter,
  maxTokens = 500,
  modelName = GPT_MODEL_NAMES.GPT_35_TURBO,
}: CombineChunksArgs) => {
  const modelAdjusted = adjustModelName(modelName);
  const combinedChunks: { tokens: number; chunk: string }[] = [];
  const candidate: string[] = [];

  const tokensOfChunks = await Promise.all(
    chunks.map((chunk) =>
      requestTokenize({ text: chunk, modelName: modelAdjusted }).then(
        (res) => ({
          tokens: Object.values(res?.tokens ?? {}).length,
          chunk,
        })
      )
    )
  );

  const tokensOfChunksAdjusted = (
    await Promise.all(
      tokensOfChunks.map(async ({ tokens, chunk }) => {
        if (tokens <= maxTokens) {
          return { tokens, chunk };
        }

        const splitBySecondaryDelimiter = chunk.split(delimiterSecondary);
        const halfIndex = (splitBySecondaryDelimiter.length >> 1) - 1;
        const firstChunk = splitBySecondaryDelimiter
          .slice(0, halfIndex)
          .join('');
        const lastChunk = splitBySecondaryDelimiter.slice(halfIndex).join('');

        return await Promise.all(
          [firstChunk, lastChunk].map((chunk) =>
            requestTokenize({ text: chunk, modelName: modelAdjusted }).then(
              (res) => ({
                tokens: Object.values(res?.tokens ?? {}).length,
                chunk,
              })
            )
          )
        );
      })
    )
  ).flat(1);

  // TODO: extendedCandidateTokens

  return { tokensOfChunks: tokensOfChunksAdjusted, combinedChunks };
};
