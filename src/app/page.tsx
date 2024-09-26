import { CaretRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Heading1, Heading2 } from '~/features/ui/headings';

export default function HomePage() {
  return (
    <>
      <header>
        <Heading1>LLM step-by-step</Heading1>
      </header>

      <section className="">
        <Heading2>Tutorials</Heading2>

        <ul>
          <li
            key={'link-summarizing-long-documents'}
            className="flex items-center max-w-full px-1 py-1 transition-transform border rounded-md cursor-pointer border-neutral-200 hover:border-neutral-400 w-max gap-x-1"
          >
            <CaretRightIcon />
            <Link
              href="/tutorials/summarizing-long-documents"
              className="cursor-pointer"
            >
              긴 문서 요약하기 (with Tiktoken)
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
