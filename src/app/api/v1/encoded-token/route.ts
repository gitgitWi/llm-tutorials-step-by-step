import { type NextRequest, NextResponse } from 'next/server';
import { getEncodedTokens } from '~/features/tiktoken/get-tokens';

// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { text = '', modelName = 'gpt-4o' } = await req.json();

  if (!text) {
    return NextResponse.json({
      error: 'text is required',
    });
  }

  return NextResponse.json({
    tokens: getEncodedTokens(text, modelName),
  });
}
