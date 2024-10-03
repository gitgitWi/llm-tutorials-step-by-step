import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import { LlmProviders } from '~/features/llm-providers';
import { createClient } from '~/features/llm-providers/index.server';

export const maxDuration = 300;

export async function POST(req: NextRequest, res: NextResponse) {
  const {
    provider = LlmProviders.AZURE_OPENAI,
    apiKey = '',
    modelName = '',
    documentText = '',
    delimiter = '',
    userPrompt = '',
  } = await req.json();

  /** @todo schema validation */
  if (!apiKey) {
    return NextResponse.json({
      error: 'apiKey is required',
    });
  }

  if (!modelName) {
    return NextResponse.json({
      error: 'modelName is required',
    });
  }

  if (!documentText) {
    return NextResponse.json({
      error: 'documentText is required',
    });
  }

  if (!delimiter) {
    return NextResponse.json({
      error: 'delimiter is required',
    });
  }

  const client = createClient({ provider, apiKey });
  if (!client) {
    return NextResponse.json({
      error: 'Provider is invalid',
    });
  }

  return generateText({
    model: client(modelName),
    prompt: [userPrompt, documentText].filter(Boolean).join('\n---\n'),
  }).then((result) => {
    /** @todo schema validation */
    return NextResponse.json({
      answerMessage: result.text,
      tokenUsage: {
        prompt: result.usage.promptTokens,
        completion: result.usage.completionTokens,
        total: result.usage.totalTokens,
      },
    });
  });
}
