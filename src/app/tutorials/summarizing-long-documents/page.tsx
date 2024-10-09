'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import type { TiktokenModel } from 'js-tiktoken';
import { default as fetcher } from 'ky';
import { LoaderIcon, SquareArrowOutUpRightIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  type InferOutput,
  enum_,
  minLength,
  object,
  pipe,
  string,
} from 'valibot';
import { useApiKey } from '~/features/api-key';
import { LlmProviderSelector, LlmProviders } from '~/features/llm-providers';
import { Button } from '~/features/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '~/features/ui/card';
import { Form, FormControl, FormField, FormItem } from '~/features/ui/form';
import { Heading2, Heading3 } from '~/features/ui/headings';
import { Input } from '~/features/ui/input';
import { ResultText } from '~/features/ui/result-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/features/ui/select';
import { Textarea } from '~/features/ui/textarea';
import { exampleDocument } from './example-document';
import { useChunking } from './use-chunking';
import { requestTokenize } from './request-tokenize';

// TODO: 스키마 정의
const SummarizeLongDocFormSchema = object({
  provider: enum_(LlmProviders),
  apiKey: pipe(
    string(),
    minLength(2, 'API 토큰은 최소 2자 이상이어야 합니다.')
  ),
  documentText: string(),
  // TODO enum TiktokenModel
  modelName: pipe(string(), minLength(1)),
  delimiter: pipe(string(), minLength(1)),
  userPrompt: pipe(string(), minLength(1)),
});

type SummarizeLongDocForm = InferOutput<typeof SummarizeLongDocFormSchema>;

type SummarizeResponse = {
  answerMessage: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  userPrompt?: string;
  modelId?: string;
  time?: number;
};

export default function SummarizingLongDocumentsPage() {
  const { apiKey, setApiKey } = useApiKey();

  // TODO: react-query 사용
  const [encodedTokens, setEncodedTokens] = useState<Record<number, number>>(
    {}
  );

  const [isPending, setIsPending] = useState(false);
  const [summaryResults, setSummaryResults] = useState<SummarizeResponse[]>([]);

  const form = useForm<SummarizeLongDocForm>({
    resolver: valibotResolver(SummarizeLongDocFormSchema),
    defaultValues: {
      apiKey,
      documentText: exampleDocument,
      modelName: 'gpt-4o',
      delimiter: '',
      userPrompt: '아래 글을 한국어로 요약해줘',
      provider: LlmProviders.AZURE_OPENAI,
    },
  });

  const { setChunkedTexts, chunks } = useChunking();

  const onSubmit = (data: SummarizeLongDocForm) => {
    setApiKey(data.apiKey);
    setIsPending(true);
    fetcher
      .post('/api/v1/completion', {
        json: {
          provider: data.provider,
          apiKey: data.apiKey,
          modelName: data.modelName,
          userPrompt: data.userPrompt,
          documentText: data.documentText,
          delimiter: data.delimiter,
        },
        timeout: 300_000,
      })
      .json<SummarizeResponse>()
      .then((response) => {
        const modified: SummarizeResponse = Object.assign({}, response, {
          time: Date.now(),
          userPrompt: data.userPrompt,
        });
        setSummaryResults((prev) => [modified].concat(prev));
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <section>
      <Heading2>긴 문서 요약하기</Heading2>

      <div className="mb-2">
        <a
          href="https://cookbook.openai.com/examples/summarizing_long_documents"
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:underline"
        >
          <SquareArrowOutUpRightIcon size={16} />
          <p>OpenAI Cookbook - Summarizing Long Documents</p>
        </a>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Card>
            <CardHeader>
              <Heading3>Step1. API Token</Heading3>
              <CardDescription>API 토큰 입력하기</CardDescription>
            </CardHeader>

            <CardContent className="gap-y-1">
              <LlmProviderSelector formControl={form.control} />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="API Token"
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>Step2. Prepare the Document</Heading3>
              <CardDescription>장문의 문서 준비</CardDescription>
            </CardHeader>

            <CardContent>
              <FormField
                control={form.control}
                name="documentText"
                render={({ field }) => (
                  <>
                    <FormItem>
                      <FormControl>
                        <Textarea {...field} className="" />
                      </FormControl>
                    </FormItem>

                    {field.value && (
                      <p className="mt-2 text-xs text-right text-neutral-500">
                        총 {field.value.length} 글자
                      </p>
                    )}
                  </>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>Step3. Tokenize the Text</Heading3>
              <CardDescription>Tiktoken 으로 문서 토크나이징</CardDescription>
            </CardHeader>

            <CardContent>
              <FormField
                control={form.control}
                name="modelName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="OpenAI 모델 선택" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value={'gpt-4o-mini' as TiktokenModel}>
                            GPT-4o-mini
                          </SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value={'gpt-3.5-turbo' as TiktokenModel}>
                            GPT-3.5-Turbo
                          </SelectItem>
                          <SelectItem value="claude-3-5-sonnet-20240620">
                            Claude 3.5 Sonnet
                          </SelectItem>
                          <SelectItem value="claude-3-haiku-20240307">
                            Claude 3 Haiku
                          </SelectItem>
                          <SelectItem value="gemini-1.5-pro">
                            Gemini 1.5 Pro
                          </SelectItem>
                          <SelectItem value="gemini-1.5-flash">
                            Gemini 1.5 Flash
                          </SelectItem>
                          <SelectItem value="gemma2-9b-it">
                            Gemma 2 9B
                          </SelectItem>
                          <SelectItem value="llama-3.1-70b-versatile">
                            Llama 3.1 70B
                          </SelectItem>
                          <SelectItem value="llama-3.1-8b-instant">
                            Llama 3.1 8B
                          </SelectItem>
                          <SelectItem value="llama-3.2-3b-preview">
                            Llama 3.2 3B (Preview)
                          </SelectItem>
                          <SelectItem value="llama-3.2-1b-preview">
                            Llama 3.2 1B (Preview)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      requestTokenize({
                        text: form.watch('documentText'),
                        modelName: form.watch('modelName'),
                      }).then((res) => {
                        res?.tokens && setEncodedTokens(res.tokens);
                      });
                    }}
                    disabled={form.watch('documentText').length === 0}
                  >
                    토큰 갯수 불러오기
                  </Button>

                  <p>토큰 갯수: {Object.keys(encodedTokens).length}</p>
                </div>

                <ResultText>
                  {Object.entries(encodedTokens)
                    .sort(
                      (a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0])
                    )
                    .map(([_, value]) => value)
                    .join(' ')}
                </ResultText>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>
                Step4. 구분자(delimiter) 설정 및 청크로 나누기
              </Heading3>
              <CardDescription>
                - 구분자 설정: 어떤 문자열을 기준으로 텍스트를 나눌 것인지
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="delimiter"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="delimiter"
                        type="text"
                        onKeyUp={(e) => {
                          if (e.key === 'Enter') {
                            setChunkedTexts(
                              form.watch('documentText'),
                              form.watch('delimiter')
                            );
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                disabled={form.watch('delimiter').length === 0}
                onClick={() => {
                  setChunkedTexts(
                    form.watch('documentText'),
                    form.watch('delimiter')
                  );
                }}
              >
                Chunk 로 나눠진 텍스트 확인하기
              </Button>
              <ResultText className="flex flex-col gap-y-2">
                {chunks.map((chunk, idx) => (
                  <p
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={`chunked-${idx}`}
                    className="p-2 rounded-lg border border-neutral-300"
                  >
                    {chunk}
                  </p>
                ))}
              </ResultText>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>Step6. Set Prompt</Heading3>
            </CardHeader>

            <CardContent>
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>Step7. 전체 프롬프트 확인</Heading3>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <ResultText>
                {[form.watch('userPrompt'), form.watch('documentText')]
                  .filter(Boolean)
                  .join('\n\n---\n')}
              </ResultText>

              <Button
                type="submit"
                disabled={
                  !form.watch('apiKey') ||
                  !form.watch('userPrompt') ||
                  isPending
                }
              >
                요약 결과 불러오기{' '}
                {isPending && <LoaderIcon className="animate-spin ml-1" />}
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <Heading3>결과</Heading3>
            </CardHeader>

            <CardContent>
              <div className="flex gap-2 overflow-x-auto min-w-full py-2">
                {summaryResults.map((result) => (
                  <div
                    key={result.time}
                    className="flex flex-col gap-2 p-2 w-full shrink-0 border rounded-lg border-neutral-300"
                  >
                    <div className="flex flex-col gap-2 my-2 w-full shrink-0">
                      <div className="flex justify-between gap-2 text-sm text-neutral-500 shrink-0">
                        <p className="">
                          {new Date(result.time ?? Date.now()).toLocaleString(
                            window.navigator.language,
                            {
                              timeZone:
                                Intl.DateTimeFormat().resolvedOptions()
                                  .timeZone,
                            }
                          )}
                        </p>

                        <code className="text-xs py-1 px-2 bg-neutral-300 rounded-lg">
                          {result.modelId ?? ''}
                        </code>
                      </div>
                      <p className="italic border-l-4 border-neutral-500 bg-neutral-200 pl-2">
                        {result.userPrompt ?? ''}
                      </p>
                    </div>

                    <ResultText>{result.answerMessage}</ResultText>

                    <div className="flex flex-col gap-2 my-2">
                      <div className="flex justify-between gap-2 text-sm text-neutral-500">
                        <p>입력(프롬프트) 토큰</p>
                        <p className="font-medium">
                          {result.tokenUsage.prompt}
                        </p>
                      </div>
                      <div className="flex justify-between gap-2 text-sm text-neutral-500">
                        <p>출력(답변) 토큰</p>
                        <p className="font-medium">
                          {result.tokenUsage.completion}
                        </p>
                      </div>
                      <div className="flex justify-between gap-2 text-sm text-neutral-500">
                        <p>전체 토큰</p>
                        <p className="font-medium">{result.tokenUsage.total}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </section>
  );
}
