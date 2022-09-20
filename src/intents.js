const fs = require('fs')
const _ = require('lodash')
const botium = require('botium-core')
const debug = require('debug')('botium-connector-nlpjs-intents')

const importIntents = async ({ caps, buildconvos }) => {
  const driver = new botium.BotDriver(caps || {})
  const container = await driver.Build()
  const compiler = await driver.BuildCompiler()

  const convos = []
  const utterances = []

  const data = container.pluginInstance.manager.toJSON()
  const domainManager = data.nluManager.domainManagers[container.pluginInstance.caps.NLPJS_LANGUAGE]
  if (domainManager && domainManager.sentences && domainManager.sentences.length > 0) {
    const uttsByIntent = domainManager.sentences.reduce((acc, s) => {
      acc[s.intent] = acc[s.intent] || []
      acc[s.intent].push(s.utterance)
      return acc
    }, {})

    for (const [intent, examples] of Object.entries(uttsByIntent)) {
      utterances.push({
        name: intent,
        utterances: examples
      })
      if (buildconvos) {
        const convo = {
          header: {
            name: intent
          },
          conversation: [
            {
              sender: 'me',
              messageText: intent
            },
            {
              sender: 'bot',
              asserters: [
                {
                  name: 'INTENT',
                  args: [intent]
                }
              ]
            }
          ]
        }
        convos.push(convo)
      }
    }
  }
  return { convos, utterances, driver, container, compiler }
}

const exportIntents = async ({ caps }, { convos, utterances }, { statusCallback }) => {
  const driver = new botium.BotDriver(caps || {})
  const container = await driver.Build()

  const status = (log) => {
    debug(log)
    if (statusCallback) statusCallback(log)
  }

  const language = container.pluginInstance.language
  const manager = container.pluginInstance.manager

  for (const utt of utterances) {
    for (const userExample of (utt.utterances || [])) {
      manager.addDocument(language, userExample, utt.name)
    }
  }
  status('Updated NLP.js model, starting training')
  await manager.train()
  status('NLP.js model is ready for use')

  const nlpModel = manager.export(false)
  const nlpjsCaps = _.pickBy(driver.caps, (value, key) => key.startsWith('NLPJS_'))

  if (container.pluginInstance.caps.NLPJS_MODEL_FILE) {
    status(`Writing NLP.js model to ${container.pluginInstance.caps.NLPJS_MODEL_FILE}`)
    fs.writeFileSync(container.pluginInstance.caps.NLPJS_MODEL_FILE, nlpModel)
    return {
      caps: {
        ...nlpjsCaps,
        NLPJS_MODEL_FILE: container.pluginInstance.caps.NLPJS_MODEL_FILE,
        NLPJS_MODEL_CONTENT: null
      }
    }
  } else {
    status('Writing NLP.js model to capability NLPJS_MODEL_CONTENT')
    return {
      caps: {
        ...nlpjsCaps,
        NLPJS_MODEL_FILE: null,
        NLPJS_MODEL_CONTENT: nlpModel
      }
    }
  }
}

module.exports = {
  importHandler: ({ caps, buildconvos, ...rest } = {}) => importIntents({ caps, buildconvos, ...rest }),
  importArgs: {
    caps: {
      describe: 'Capabilities',
      type: 'json',
      skipCli: true
    },
    buildconvos: {
      describe: 'Build convo files for intent assertions (otherwise, just write utterances files)',
      type: 'boolean',
      default: false
    }
  },
  exportHandler: ({ caps, ...rest } = {}, { convos, utterances } = {}, { statusCallback } = {}) => exportIntents({ caps, ...rest }, { convos, utterances }, { statusCallback }),
  exportArgs: {
    caps: {
      describe: 'Capabilities',
      type: 'json',
      skipCli: true
    }
  }
}
