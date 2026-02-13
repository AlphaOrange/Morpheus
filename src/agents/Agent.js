import axios from 'axios'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API = {
  gemini25_flash_lite: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
  gemini25_flash: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
  gemini20_flash: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
}

export default class Agent {
  // Super Agent
  // This is the Agent top-level class to be inherited from
  // This class provides all AI handling, evaluation, data cleaning and checking

  systemPrompt = 'You are a super-helpful AI assistent.'
  model = 'gemini25_flash_lite'
  timeout = 6000

  async query(prompt) {
    console.log(`== PROMPT ==\n${prompt}`)
    const body = {
      systemInstruction: { role: 'system', parts: [{ text: this.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }
    try {
      const response = await axios.post(API[this.model], body, {
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
      console.log(`ERROR: ${err.response?.data?.error?.message || err.message || 'Unknown error'}`)
      return null
    }
  }
}
