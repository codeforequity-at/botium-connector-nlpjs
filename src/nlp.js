const path = require('path')
const botium = require('botium-core')
const { dockStart } = require('@nlpjs/basic')
const debug = require('debug')('botium-connector-nlpjs-nlp')

const getCaps = (caps) => {
  const result = Object.assign({}, caps || {})
  result.CONTAINERMODE = path.resolve(__dirname, '..', 'index.js')
  return result
}

const trainIntentUtterances = async ({ caps }, intents) => {
  const driver = new botium.BotDriver(getCaps(caps))

  const language = driver.caps.NLPJS_LANGUAGE || 'en'
  const dock = await dockStart({ use: ['Basic', 'Qna'], settings: { nlp: { autoSave: false, languages: [language] } } })
  const manager = dock.get('nlp')

  for (const intent of intents || []) {
    for (const utterance of intent.utterances || []) {
      await manager.addDocument(language, utterance, intent.intentName)
    }
  }
  await manager.train()
  debug('NLP.js model trained')

  const nlpModel = manager.export(true)

  return {
    caps: Object.assign({}, getCaps(caps), {
      NLPJS_MODEL_CONTENT: nlpModel
    }),
    tempManager: manager
  }
}

module.exports = {
  extractIntentUtterances: () => { throw new Error('extractIntentUtterances not implemented') },
  trainIntentUtterances,
  cleanupIntentUtterances: () => {}
}
