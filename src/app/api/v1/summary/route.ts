import { type NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { array, number, object, parse, pipe, string, transform } from 'valibot';

export async function POST(req: NextRequest, res: NextResponse) {
  const {
    apiKey = '',
    modelName = '',
    documentText = '',
    delimiter = '',
    userPrompt = '',
  } = await req.json();

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

  const client = new AzureOpenAI({
    apiKey,
    apiVersion: '2024-02-15-preview',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    deployment: 'gpt-4o',
  });

  const completionPromise = client.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: 'user',
        content: `${userPrompt}\n\n---\n${documentText}`,
      },
    ],
  });

  return NextResponse.json(
    await completionPromise.then(parseChatCompletionResponse)
  );
}

/**
 * chat response data
 * @example
 * 
 * {
  "id": "chatcmpl-ABZ31XOGweCxWExg1GdPsFjEqcRsr",
  "object": "chat.completion",
  "created": 1727319695,
  "model": "gpt-4o-2024-05-13",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "이제 우리는 컨트롤 가능한 세부 수준으로 텍스트를 요약하기 위한 유틸리티를 정의할 수 있습니다(세부사항 매개변수를 참고하세요).\n\n이 함수는 먼저 컨트롤 가능한 세부사항 매개변수를 기반으로 최소 및 최대 청크 수 사이를 보간하여 청크의 수를 결정합니다. 그런 다음 텍스트를 청크로 분할하고 각 청크를 요약합니다."
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 76,
    "completion_tokens": 96,
    "total_tokens": 172
  },
  "system_fingerprint": "fp_67802d9a6d"
}
 */
const OpenAIChatCompletionSchema = object({
  // id: string(),
  // object: string(),
  // created: number(),
  // model: string(),
  choices: array(
    object({
      index: number(),
      message: object({
        role: string(),
        content: string(),
      }),
      // logprobs: object({
      //   tokens: string(),
      //   token_logprobs: string(),
      //   top_logprobs: string(),
      //   text_offset: string(),
      // }),
      finish_reason: string(),
    })
  ),
  usage: object({
    prompt_tokens: number(),
    completion_tokens: number(),
    total_tokens: number(),
  }),
  // system_fingerprint: string(),
});

const parseChatCompletionResponse = (res: unknown) =>
  parse(
    pipe(
      OpenAIChatCompletionSchema,

      transform((data) => ({
        answerMessage: data.choices[0]?.message.content ?? '',
        tokenUsage: {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        },
      }))
    ),
    res
  );
