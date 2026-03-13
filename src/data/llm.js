export const API = {
  gemini25_flash_lite: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=`,
  gemini25_flash: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`,
}

export const safetySettings = {
  harassment: 'BLOCK_ONLY_HIGH',
  hateSpeech: 'BLOCK_ONLY_HIGH',
  sex: 'BLOCK_NONE',
  dangerous: 'BLOCK_MEDIUM_AND_ABOVE',
}
