export enum LlmProviders {
  AZURE_OPENAI = 'azure-openai',
  OPENAI = 'openai',
  GROQ = 'groq',
  GOOGLE_AI = 'google-ai',
  ANTHROPIC = 'anthropic',
}

export const LLM_PROVIDERS = [
  {
    groupName: 'OpenAI Compatible',
    providers: [
      {
        key: LlmProviders.OPENAI,
        name: 'OpenAI',
        enabled: false,
      },
      {
        key: LlmProviders.AZURE_OPENAI,
        name: 'Azure OpenAI',
        enabled: true,
      },
      {
        key: LlmProviders.GROQ,
        name: 'Groq',
        enabled: true,
      },
    ],
  },
  {
    groupName: 'Google AI',
    providers: [
      {
        key: LlmProviders.GOOGLE_AI,
        name: 'Google AI',
        enabled: true,
      },
    ],
  },
  {
    groupName: 'Anthropic',
    providers: [
      {
        key: LlmProviders.ANTHROPIC,
        name: 'Anthropic',
        enabled: false,
      },
    ],
  },
] as const;
