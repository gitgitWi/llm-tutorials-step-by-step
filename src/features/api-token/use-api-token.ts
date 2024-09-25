import { create } from 'zustand';

type ApiTokenStates = {
  apiToken: string;
  setApiToken: (apiToken: string) => void;
  resetApiToken: () => void;
};

export const useApiToken = create<ApiTokenStates>((set) => ({
  apiToken: '',
  setApiToken: (apiToken: string) => set({ apiToken }),
  resetApiToken: () => set({ apiToken: '' }),
}));
