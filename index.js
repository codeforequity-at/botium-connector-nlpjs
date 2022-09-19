const BotiumConnectorNLPjs = require('./src/connector')
const { extractIntentUtterances, trainIntentUtterances, cleanupIntentUtterances } = require('./src/nlp')

module.exports = {
  PluginVersion: 1,
  PluginClass: BotiumConnectorNLPjs,
  NLP: {
    ExtractIntentUtterances: extractIntentUtterances,
    TrainIntentUtterances: trainIntentUtterances,
    CleanupIntentUtterances: cleanupIntentUtterances
  },
  PluginDesc: {
    name: 'NLP.js',
    provider: 'AXA Group',
    features: {
      intentResolution: true,
      intentConfidenceScore: true,
      alternateIntents: true,
      entityResolution: true
    },
    validate: async (caps) => {
      if (!caps.NLPJS_MODEL_FILE && !caps.NLPJS_MODEL_QNAFILE && !caps.NLPJS_MODEL_QNACONTENT) {
        return {
          NLPJS_MODEL_FILE: 'Model File or QNA Content required',
          NLPJS_MODEL_QNAFILE: 'Model File or QNA Content required',
          NLPJS_MODEL_QNACONTENT: 'Model File or QNA Content required'
        }
      }
    },
    capabilities: [
      {
        name: 'NLPJS_LANGUAGE',
        label: 'Locale Code',
        type: 'string',
        helperText: '2-letter locale code (see <a href="https://github.com/axa-group/nlp.js/blob/master/docs/v4/language-support.md#supported-languages">supported languages</a>)',
        required: true
      },
      {
        name: 'NLPJS_MODEL_FILE',
        label: 'Model File',
        type: 'file'
      },
      {
        name: 'NLPJS_MODEL_QNAFILE',
        label: 'QNA File',
        type: 'file',
        helperText: 'Questions and Answer file'
      },
      {
        name: 'NLPJS_MODEL_QNACONTENT',
        label: 'QNA Content',
        type: 'text',
        helperText: 'Questions and Answer content - each line contains a question and an answer'
      },
      {
        name: 'NLPJS_MODEL_QNASEPARATOR',
        label: 'QNA Separator',
        type: 'string',
        helperText: 'Questions and Answer separator - default is the "tab" character (\t)',
        required: false
      }
    ]
  }
}
