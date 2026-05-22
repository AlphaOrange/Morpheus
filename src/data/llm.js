export const models = {
  Google: ['gemini-2.5-flash-lite', 'gemini-2.5-flash'],
  OpenAI: ['gpt-5.4-mini', 'gpt-5.4-nano'],
}

export const safetySettings = {
  harassment: 'BLOCK_ONLY_HIGH',
  hateSpeech: 'BLOCK_ONLY_HIGH',
  sex: 'BLOCK_NONE',
  dangerous: 'BLOCK_MEDIUM_AND_ABOVE',
}
