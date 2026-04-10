import { GoogleGenAI } from '@google/genai'
import { useShelfStore } from '@/stores/shelf'
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
  shelf = useShelfStore()
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

    return { text: response.text, tokens: response.usageMetadata.totalTokenCount }
  }

  async query({ prompt, type = 'json' }) {
    prompt = this.enhance_prompt(prompt)
    console.log(`== PROMPT ==\n${prompt}`)

    // Legal Check: did user give permission?
    if (!this.options.legalAllowAI) {
      throw new Error(
        'Data submission not allowed. You need us to give permission to send your data first! Go to the Options view and see under "AI Configuration"',
      )
    }

    // Run AI Model
    let response = null
    if (this.options.aiVendor === 'Google') {
      response = await this.query_google(prompt)
    } else {
      throw new Error('AI Vendor not supported')
    }
    this.shelf.tokenUsage = this.shelf.tokenUsage + response.tokens

    // Return text or JSON
    let responseText = response.text
    if (type === 'json') {
      const jsonText = responseText.substring(
        responseText.indexOf('{'),
        responseText.lastIndexOf('}') + 1,
      )
      return JSON.parse(jsonText)
    }
    return responseText
  }
}
