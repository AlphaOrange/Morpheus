import { safetySettings } from '@/data/llm'

// Structure per entry:
// [name, default value, save with book, allow user to change via command]

export default [
  // === ENGINE SETTINGS (NO runtime changes, neither by book nor by user)

  // Display parameters
  ['lookbackInfo', 10, false, false], // how many messages until an Info message disappears?
  ['lookbackSystem', 20, false, false], // how many messages until a System message disappears?
  ['lookbackError', 5, false, false], // how many messages until an Error message disappears?
  ['compactButtonsThreshold', 20, false, false], // number of buttons for activating compact buttons display

  // Pressure parameters (deciding who acts next)
  ['pressure_notSpokenYet', 100, false, false],
  ['pressure_notAnsweredYet', 80, false, false],
  ['pressure_spokenToUnresolved', -50, false, false],
  ['pressure_runningDialog', 60, false, false],
  ['pressure_notSpokenRounds', 15, false, false],
  ['pressure_threshold', 40, false, false], // if max pressure above, ai must act
  ['pressure_noActionProb', 0.5, false, false], // max probability of no-action if below threshold
  ['maxRunningDialogLength', 8, false, false], // running dialog length for max pressure
  ['maxNotSpokenRounds', 12, false, false], // not spoken rounds for max pressure
  ['multiActionThreshold', 100, false, false], // threshold, pressure threshold to allow additional npc action
  ['multiActionMaxCycles', 3, false, false], // threshold: number of max npc actions per round
  ['waitBetweenNpcActions', 0.5, false, false], // wait time before executing possible next npc action (in addition to execution time!)

  // Game Flow
  ['sceneIdleLength', 3600, false, false], // seconds without action until a scene is ended
  ['lookbackLastSpoken', 30, false, false], // how many messages max checking to find who actor has last spoken to

  // AI Parameters (how to build prompts)
  ['repeatTimestampAfterSeconds', 600, false, false], // seconds after which timestamp is shown again in formatted dialog

  // === USER SETTINGS (runtime changes by user)

  // UX Settings
  ['idHintsMode', 'auto', true, true], // can be "never", "auto", "always"
  ['idlingBeforeTriggerNpc', 4, true, true], // seconds of idling until NPC actions are triggered
  ['useCompactButtons', true, true, true], // use compact buttons on cluttered action bar

  // AI Control
  ['useAiForSavegameSummary', false, true, true], // if true use ai agent on save, otherwise use description as summary
  ['showTokenUsage', false, true, true], // show number of tokens (in + out) used in this session

  // AI Configuration
  ['aiVendor', 'Google', true, true],
  ['aiModel', 'gemini-2.5-flash-lite', true, true],
  ['aiApiKey', import.meta.env.VITE_GEMINI_API_KEY, true, false], // false -> we don't want people to type their key during play
  ['aiApiKeyAllowSave', import.meta.env.VITE_ALLOW_SAVE_KEY === 'true', true, true],
  ['aiSafetyHarassment', safetySettings.harassment, true, true],
  ['aiSafetyHateSpeech', safetySettings.hateSpeech, true, true],
  ['aiSafetySex', safetySettings.sex, true, true],
  ['aiSafetyDangerous', safetySettings.dangerous, true, true],

  // Opt-In Legal Consent
  ['legalAllowAI', import.meta.env.VITE_GENERAL_CONSENT === 'true', true, false],
  ['legalAllowLocalStorage', import.meta.env.VITE_GENERAL_CONSENT === 'true', true, false],

  // === BOOK SETTINGS (runtime set by book, therefore here all null)
  ['talkDuration', null, true, false], // seconds that pass per talk action
  ['moveDurationRoom', null, true, false], // seconds to adjacent room
  ['moveDurationLocation', null, true, false], // seconds / 1 distance location move
  ['moveDurationDestination', null, true, false], // seconds / 1 distance destination move
  ['minPlayerChars', null, false, false], // min number of characters player must choose to control
  ['maxPlayerChars', null, false, false], // max number of characters player may choose to control

  // === RUNTIME CONTROL (runtime changes by engine)
  ['idHintsActive', false, false, false],
  [
    'lightbox',
    {
      component: null,
      props: {},
    },
    false,
    false,
  ],
  ['narratorRunning', false, false, false],
  ['narratorRunningMessage', '', false, false],
]
