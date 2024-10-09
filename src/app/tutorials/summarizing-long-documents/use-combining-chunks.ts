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

type CombinedChunk = {
  tokens: number;
  chunk: string;
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
      setCombinedChunks([]);

      _combineChunks(
        Object.assign({}, args, {
          maxTokens,
          /** @todo extract as util */
          delimiter: args.delimiter === '\\n' ? '\n' : args.delimiter,
        })
      )
        .then(({ combinedChunks }) => {
          setCombinedChunks(combinedChunks);
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

  const tokensOfChunks = await Promise.all(
    chunks.map((chunk) =>
      requestTokenize({ text: chunk, modelName: modelAdjusted }).then(
        (res) =>
          ({
            tokens: Object.values(res?.tokens ?? {}).length,
            chunk,
          }) as CombinedChunk
      )
    )
  );

  const tokensOfChunksAdjusted = (
    await Promise.all(
      tokensOfChunks.map(async ({ tokens, chunk }) => {
        if (tokens <= maxTokens) {
          return { tokens, chunk } as CombinedChunk;
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
              (res) =>
                ({
                  tokens: Object.values(res?.tokens ?? {}).length,
                  chunk,
                }) as CombinedChunk
            )
          )
        );
      })
    )
  ).flat(1);

  const combinedChunks: CombinedChunk[] = [{ tokens: 0, chunk: '' }];

  for await (const chunk of tokensOfChunksAdjusted) {
    const lastChunk = combinedChunks.pop() ?? { tokens: 0, chunk: '' };
    const extendedCandidateChunk = [lastChunk.chunk, chunk.chunk].join(
      delimiter
    );

    const extendedCandidateTokens = await requestTokenize({
      text: extendedCandidateChunk,
      modelName: modelAdjusted,
    }).then((res) => Object.values(res?.tokens ?? {}).length);

    if (extendedCandidateTokens <= maxTokens) {
      combinedChunks.push({
        tokens: extendedCandidateTokens,
        chunk: extendedCandidateChunk,
      });
    } else {
      combinedChunks.push(lastChunk);
      combinedChunks.push(chunk);
    }
  }

  return { tokensOfChunks: tokensOfChunksAdjusted, combinedChunks };
};
