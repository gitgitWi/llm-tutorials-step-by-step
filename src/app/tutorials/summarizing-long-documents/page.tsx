'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { useForm } from 'react-hook-form';
import { type InferOutput, minLength, object, pipe, string } from 'valibot';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '~/features/ui/card';
import { Form, FormControl, FormField, FormItem } from '~/features/ui/form';
import { Heading2, Heading3 } from '~/features/ui/headings';
import { Input } from '~/features/ui/input';
import { Textarea } from '~/features/ui/textarea';

// TODO: 스키마 정의
const SummarizeLongDocFormSchema = object({
  apiToken: pipe(
    string(),
    minLength(2, 'API 토큰은 최소 2자 이상이어야 합니다.')
  ),
  documentText: pipe(
    string(),
    minLength(2, '문서 텍스트는 최소 2자 이상이어야 합니다.')
  ),
});

type SummarizeLongDocFormSchema = InferOutput<
  typeof SummarizeLongDocFormSchema
>;

export default function SummarizingLongDocumentsPage() {
  const form = useForm<SummarizeLongDocFormSchema>({
    resolver: valibotResolver(SummarizeLongDocFormSchema),
    defaultValues: {
      apiToken: '',
      documentText: '',
    },
  });

  const onSubmit = async (data: SummarizeLongDocFormSchema) => {
    console.debug('[onSubmit.form]', form);
    console.debug('[onSubmit]', data);
  };

  return (
    <section>
      <Heading2>긴 문서 요약하기</Heading2>

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

            <CardContent>
              <FormField
                control={form.control}
                name="apiToken"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="API Token" {...field} />
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
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        {...field}
                        minLength={2}
                        rows={6}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading3>Step3. Tokenize the Text</Heading3>
              <CardDescription>Tiktoken 으로 문서 토크나이징</CardDescription>
            </CardHeader>

            <CardContent>{/*  */}</CardContent>
          </Card>
        </form>
      </Form>
    </section>
  );
}
