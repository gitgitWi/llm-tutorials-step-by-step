import { useState } from 'react';

export const useChunking = () => {
  const [chunks, setChunks] = useState<string[]>([]);

  const setChunkedTexts = (text: string, delimiter: string) => {
    setChunks(getChunks(text, delimiter));
  };

  return {
    chunks,
    setChunkedTexts,
  };
};

const getChunks = (text: string, delimiter: string) => {
  let delimiterAdjusted = delimiter;
  if (delimiter === '\\n') {
    delimiterAdjusted = '\n';
  }

  return text
    .split(delimiterAdjusted)
    .filter(Boolean)
    .map((text) => text.trim());
};
