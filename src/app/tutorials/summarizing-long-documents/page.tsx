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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/features/ui/select';
import { Textarea } from '~/features/ui/textarea';

// TODO: 스키마 정의
const SummarizeLongDocFormSchema = object({
  provider: enum_(LlmProviders),
  apiKey: pipe(
    string(),
    minLength(2, 'API 토큰은 최소 2자 이상이어야 합니다.')
  ),
  documentText: pipe(
    string(),
    minLength(2, '문서 텍스트는 최소 2자 이상이어야 합니다.')
  ),
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
};

export default function SummarizingLongDocumentsPage() {
  const { apiKey, setApiKey } = useApiKey();

  // TODO: react-query 사용
  const [encodedTokens, setEncodedTokens] = useState<Record<number, number>>(
    {}
  );

  const [isPending, setIsPending] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummarizeResponse>({
    answerMessage: '',
    tokenUsage: {
      prompt: 0,
      completion: 0,
      total: 0,
    },
  });

  const form = useForm<SummarizeLongDocForm>({
    resolver: valibotResolver(SummarizeLongDocFormSchema),
    defaultValues: {
      apiKey,
      documentText: '',
      modelName: 'gpt-4o',
      delimiter: '\\n',
      userPrompt: '아래 문장을 요약해줘',
      provider: LlmProviders.AZURE_OPENAI,
    },
  });

  const onSubmit = (data: SummarizeLongDocForm) => {
    console.debug('[onSubmit]', data);
    setApiKey(data.apiKey);
    setIsPending(true);
    fetcher
      .post('/api/v1/summary', {
        json: {
          provider: data.provider,
          apiKey: data.apiKey,
          modelName: data.modelName,
          userPrompt: data.userPrompt,
          documentText: data.documentText,
          delimiter: data.delimiter,
        },
      })
      .json<SummarizeResponse>()
      .then((response) => {
        setSummaryResult(response);
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
                        <Textarea {...field} minLength={2} className="" />
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
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      fetcher
                        .post('/api/v1/encoded-token', {
                          json: {
                            text: form.getValues('documentText'),
                            modelName: form.getValues('modelName'),
                          },
                        })
                        .json<{ tokens: Record<number, number> }>()
                        .then((res) => {
                          res?.tokens && setEncodedTokens(res.tokens);
                        });
                    }}
                    disabled={form.watch('documentText').length === 0}
                  >
                    토큰 갯수 불러오기
                  </Button>

                  <p>토큰 갯수: {Object.keys(encodedTokens).length}</p>
                </div>

                <pre className="p-2 overflow-auto text-xs whitespace-pre-wrap border rounded-lg border-neutral-300 bg-neutral-100 min-h-32 max-h-[600px]">
                  {Object.entries(encodedTokens)
                    .sort(
                      (a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0])
                    )
                    .map(([_, value]) => value)
                    .join(' ')}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>Step4. Set Delimiter</Heading3>
              <CardDescription>
                구분자 설정 - 어떤 문자를 기준으로 텍스트를 나눌 것인지
              </CardDescription>
            </CardHeader>

            <CardContent>
              <FormField
                control={form.control}
                name="delimiter"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="delimiter" type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>Step5. Check Chunked Text</Heading3>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <Button type="button" disabled>
                TODO: Chunk 로 나눠진 텍스트 확인하기
              </Button>
              {/* <Textarea readOnly defaultValue={''} /> */}
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
              <pre className="p-2 overflow-auto text-xs whitespace-pre-wrap border rounded-lg border-neutral-300 bg-neutral-100 min-h-32 max-h-[600px]">
                {[form.watch('userPrompt'), form.watch('documentText')]
                  .filter(Boolean)
                  .join('\n\n---\n')}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Button
                type="submit"
                disabled={
                  !form.watch('apiKey') ||
                  !form.watch('userPrompt') ||
                  isPending
                }
              >
                요약 결과 불러오기{' '}
                {isPending && <LoaderIcon className="animate-spin" />}
              </Button>
            </CardHeader>

            <CardContent>
              <pre className="p-2 overflow-auto text-xs whitespace-pre-wrap border rounded-lg border-neutral-300 bg-neutral-100 min-h-32 max-h-[600px]">
                {summaryResult.answerMessage}
              </pre>

              <div className="flex flex-col gap-2 my-2">
                <div className="flex justify-between gap-2 text-sm text-neutral-500">
                  <p>입력(프롬프트) 토큰</p>
                  <p className="font-medium">
                    {summaryResult.tokenUsage.prompt}
                  </p>
                </div>
                <div className="flex justify-between gap-2 text-sm text-neutral-500">
                  <p>출력(답변) 토큰</p>
                  <p className="font-medium">
                    {summaryResult.tokenUsage.completion}
                  </p>
                </div>
                <div className="flex justify-between gap-2 text-sm text-neutral-500">
                  <p>전체 토큰</p>
                  <p className="font-medium">
                    {summaryResult.tokenUsage.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </section>
  );
}
