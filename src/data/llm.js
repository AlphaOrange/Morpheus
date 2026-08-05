export const models = {
  Google: ['gemini-2.5-flash-lite', 'gemini-2.5-flash'],
  OpenAI: ['gpt-5.4-mini', 'gpt-5.4-nano'],
  DeepSeek: ['deepseek-v4-flash', 'deepseek-v4-pro'],
}

export const safetySettings = {
  none: {
    harassment: 'BLOCK_NONE',
    hateSpeech: 'BLOCK_NONE',
    sex: 'BLOCK_NONE',
    dangerous: 'BLOCK_NONE',
  },
  medium: {
    harassment: 'BLOCK_ONLY_HIGH',
    hateSpeech: 'BLOCK_ONLY_HIGH',
    sex: 'BLOCK_NONE',
    dangerous: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  high: {
    harassment: 'BLOCK_MEDIUM_AND_ABOVE',
    hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
    sex: 'BLOCK_MEDIUM_AND_ABOVE',
    dangerous: 'BLOCK_MEDIUM_AND_ABOVE',
  },
}
