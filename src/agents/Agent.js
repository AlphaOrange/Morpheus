import axios from 'axios'
import { useOptionsStore } from '@/stores/options'

const API = {
  gemini25_flash_lite: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=`,
  gemini25_flash: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`,
  gemini20_flash: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=`, //TODO: deprecated
}

// TODO: make these configurable
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_ONLY_HIGH',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
]

const generationConfig = {
  temperature: 0.7,
}

export default class Agent {
  // Super Agent
  // This is the Agent top-level class to be inherited from
  // This class provides all AI handling, evaluation, data cleaning and checking

  systemPrompt = 'You are a super-helpful AI assistent.'
  responseFormat = null
  responseExample = null
  timeout = 30000
  options = useOptionsStore()

  async query(prompt) {
    if (this.responseFormat) {
      prompt = `${prompt}

You must exclusively use this exact json template for your answer and nothing else:

${this.responseFormat}`
    }
    if (this.responseExample) {
      prompt = `${prompt}

### EXAMPLE OUTPUT ###

${this.responseExample}`
    }
    console.log(`== PROMPT ==\n${prompt}`)
    const body = {
      systemInstruction: { role: 'system', parts: [{ text: this.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig,
    }
    try {
      const apiCall = API[this.options.aiModel] + this.options.aiApiKey
      const response = await axios.post(apiCall, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeout,
      })
      let text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null
      console.log(`== RESPONSE ==\n${text}`)
      text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
      console.log(`== CLEAN RESPONSE ==\n${text}`)
      const json = JSON.parse(text)
      return json
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`ERROR: ${errorMessage}`)
      return { error: errorMessage }
    }
  }
}
