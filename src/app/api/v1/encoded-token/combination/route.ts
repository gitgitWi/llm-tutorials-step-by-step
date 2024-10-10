import type { NextRequest } from 'next/server';
import type {
  ChunkCombinationRequest,
  ChunkCombinationResponse,
} from '~/app/tutorials/summarizing-long-documents/chunk-combination.types';
import { getEncodedTokens } from '~/features/tiktoken';
import { getChunkCombinations } from './get-chunk-combinations';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { chunks, modelName, delimiter, maxTokens } =
    (await req.json()) as ChunkCombinationRequest;

  /** @todo validate schema */
  if (!chunks || !modelName || !delimiter || !maxTokens) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
    });
  }

  return new Response(
    JSON.stringify({
      combinedChunks: getChunkCombinations({
        chunks,
        modelName,
        delimiter,
        maxTokens,
      }),
    } as ChunkCombinationResponse),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}

getEncodedTokens;
