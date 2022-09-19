const util = require('util')
const fs = require('fs')
const { ConversationContext } = require('node-nlp')
const { dockStart } = require('@nlpjs/basic')
const debug = require('debug')('botium-connector-nlpjs')

const Capabilities = {
  NLPJS_LANGUAGE: 'NLPJS_LANGUAGE',
  NLPJS_MODEL_OBJECT: 'NLPJS_MODEL_OBJECT',
  NLPJS_MODEL_FILE: 'NLPJS_MODEL_FILE',
  NLPJS_MODEL_QNAFILE: 'NLPJS_MODEL_QNAFILE',
  NLPJS_MODEL_QNACONTENT: 'NLPJS_MODEL_QNACONTENT',
  NLPJS_MODEL_QNASEPARATOR: 'NLPJS_MODEL_QNASEPARATOR'
}

const Defaults = {
  [Capabilities.NLPJS_LANGUAGE]: 'en',
  [Capabilities.NLPJS_MODEL_QNASEPARATOR]: '\t'
}

const INCOMPREHENSION_INTENT = 'None'
const isIncomprehension = (intent) => {
  if (intent === INCOMPREHENSION_INTENT) {
    return true
  }
  return false
}

class BotiumConnectorNLPjs {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = Object.assign({}, Defaults, caps)
  }

  async Validate () {
    if (!this.caps[Capabilities.NLPJS_MODEL_OBJECT] && !this.caps[Capabilities.NLPJS_MODEL_FILE] && !this.caps[Capabilities.NLPJS_MODEL_QNAFILE] && !this.caps[Capabilities.NLPJS_MODEL_QNACONTENT]) throw new Error('NLPJS_MODEL_OBJECT or NLPJS_MODEL_FILE or or NLPJS_MODEL_QNAFILE or NLPJS_MODEL_QNACONTENT capability required')
  }

  async Build () {
    debug('Build called')
    this.language = this.caps[Capabilities.NLPJS_LANGUAGE]

    this.dock = await dockStart({ use: ['Basic', 'Qna'], settings: { nlp: { autoSave: false, languages: [this.language] } } })
    this.manager = this.dock.get('nlp')

    if (this.caps[Capabilities.NLPJS_MODEL_OBJECT]) {
      this.manager.import(this.caps[Capabilities.NLPJS_MODEL_OBJECT])
    } else if (this.caps[Capabilities.NLPJS_MODEL_FILE]) {
      try {
        const data = fs.readFileSync(this.caps[Capabilities.NLPJS_MODEL_FILE], 'utf8')
        this.manager.import(data)
      } catch (err) {
        throw new Error(`Failed loading model file from ${this.caps[Capabilities.NLPJS_MODEL_FILE]}: ${err.message}`)
      }
    } else if (this.caps[Capabilities.NLPJS_MODEL_QNACONTENT]) {
      try {
        await this.manager.addCorpus({
          content: this.caps[Capabilities.NLPJS_MODEL_QNACONTENT],
          importer: 'qna',
          locale: this.caps[Capabilities.NLPJS_LANGUAGE],
          separator: this.caps[Capabilities.NLPJS_MODEL_QNASEPARATOR]
        })
        await this.manager.train()
      } catch (err) {
        throw new Error(`Failed loading QNA content: ${err.message}`)
      }
    } else if (this.caps[Capabilities.NLPJS_MODEL_QNAFILE]) {
      try {
        await this.manager.addCorpus({
          filename: this.caps[Capabilities.NLPJS_MODEL_QNAFILE],
          importer: 'qna',
          locale: this.caps[Capabilities.NLPJS_LANGUAGE],
          separator: this.caps[Capabilities.NLPJS_MODEL_QNASEPARATOR]
        })
        await this.manager.train()
      } catch (err) {
        throw new Error(`Failed loading QNA file from ${this.caps[Capabilities.NLPJS_MODEL_QNAFILE]}: ${err.message}`)
      }
    }
  }

  async Start () {
    this.context = new ConversationContext()
  }

  async UserSays (msg) {
    const nlpResult = await this.manager.process(this.language, msg.messageText, this.context)
    debug(`NLPJs processing (${this.language}): "${msg.messageText}" => ${JSON.stringify(nlpResult, null, 2)}`)

    const structuredResponse = {
      sender: 'bot',
      messageText: nlpResult.answer || null,
      nlp: {
        intent: {
          name: nlpResult.intent,
          confidence: nlpResult.score,
          incomprehension: isIncomprehension(nlpResult.intent),
          intents: nlpResult.classifications && nlpResult.classifications.map(c => ({
            name: c.intent || c.label,
            confidence: c.score || c.value,
            incomprehension: isIncomprehension(c.intent || c.label)
          }))
        },
        entities: nlpResult.entities && nlpResult.entities.map(e => ({
          name: e.entity,
          value: e.option
        }))
      },
      sourceData: nlpResult
    }
    debug(`Converted response: ${util.inspect(structuredResponse)}`)
    setTimeout(() => this.queueBotSays(structuredResponse), 0)
  }

  async Stop () {
    this.context = null
  }

  async Clean () {
    this.dock = null
    this.manager = null
  }
}

module.exports = BotiumConnectorNLPjs
