import { create } from 'zustand';

type ApiKeyStates = {
  apiKey: string;
  setApiKey: (apiToken: string) => void;
  resetApiKey: () => void;
};

export const useApiKey = create<ApiKeyStates>((set) => ({
  apiKey: '',
  setApiKey: (apiKey: string) => set({ apiKey }),
  resetApiKey: () => set({ apiKey: '' }),
}));
