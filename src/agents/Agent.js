import { GoogleGenAI } from '@google/genai'
import { useOptionsStore } from '@/stores/options'

export default class Agent {
  // Super Agent
  // This is the Agent top-level class to be inherited from
  // This class provides all AI handling, evaluation, data cleaning and checking

  // Agent Prompt
  systemPrompt = 'You are a super-helpful AI assistent.'
  responseFormat = null
  responseExample = null

  // Options
  options = useOptionsStore()
  timeout = 30000
  aiKey = ''

  // Google AI
  generationConfig = {
    temperature: 0.7,
  }
  googleAi = null

  // AI lazy init
  getGoogleAi() {
    if (!this.options.aiApiKey) {
      throw new Error('Missing API key')
    }
    if (!this.googleAi || this.aiKey !== this.options.aiApiKey) {
      this.googleAi = new GoogleGenAI({
        apiKey: this.options.aiApiKey,
      })
      this.aiKey = this.options.aiApiKey
    }
    return this.googleAi
  }

  // Extend prompt with format and example if available
  enhance_prompt(prompt) {
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
    return prompt
  }

  // Run on Google API
  async query_google(prompt) {
    // For Google models directly attach system and user prompt
    prompt = `${this.systemPrompt}\n\n${prompt}`

    // Generate response
    const response = await this.getGoogleAi().models.generateContent({
      model: this.options.aiModel,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: this.generationConfig,
      safetySettings: this.options.aiSafetySettingsGemini,
    })

    // Parse result
    console.log(`== RESPONSE ==\n${response.text}`)
    const jsonText = response.text.substring(
      response.text.indexOf('{'),
      response.text.lastIndexOf('}') + 1,
    )
    console.log(`== JSON ==\n${jsonText}`)
    const json = JSON.parse(jsonText)
    return json
  }

  async query(prompt) {
    prompt = this.enhance_prompt(prompt)
    console.log(`== PROMPT ==\n${prompt}`)
    try {
      if (this.options.aiVendor === 'Google') {
        return await this.query_google(prompt)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error'
      console.log(`ERROR: ${errorMessage}`)
      return { error: errorMessage }
    }
  }
}
