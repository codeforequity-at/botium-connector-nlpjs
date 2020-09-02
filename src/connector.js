const util = require('util')
const fs = require('fs')
const { NlpManager } = require('node-nlp')
const debug = require('debug')('botium-connector-nlpjs')

const { BotiumError, Capabilities: CoreCapabilities } = require('botium-core')

const Capabilities = {
  NLPJS_LANGUAGE: 'NLPJS_LANGUAGE',
  NLPJS_MODEL_OBJECT: 'NLPJS_MODEL_OBJECT',
  NLPJS_MODEL_FILE: 'NLPJS_MODEL_FILE'
}

const Defaults = {
  [Capabilities.NLPJS_LANGUAGE]: 'en'
}

const INCOMPREHENSION_INTENT = 'None'
const isIncomprehension = (intent) => {
  if (intent === INCOMPREHENSION_INTENT) {
    return true
  }
}

class BotiumConnectorNLPjs {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = Object.assign({}, Defaults, caps)
    if (!this.caps[CoreCapabilities.SECURITY_ALLOW_UNSAFE]) {
      throw new BotiumError(
        'Security Error. Using NLPjs Connector is not allowed',
        {
          type: 'security',
          subtype: 'allow unsafe',
          source: 'botium-connector-nlpjs'
        }
      )
    }


  }

  async Validate () {
    if (!this.caps[Capabilities.NLPJS_MODEL_OBJECT] && !this.caps[Capabilities.NLPJS_MODEL_FILE]) throw new Error('NLPJS_MODEL_OBJECT or NLPJS_MODEL_FILE capability required')
  }

  async Build () {
    debug('Build called')

    this.manager = new NlpManager({
      autoSave: false
    })
    if (this.caps[Capabilities.NLPJS_MODEL_OBJECT]) {
      this.manager.import(this.caps[Capabilities.NLPJS_MODEL_OBJECT])
    } else if (this.caps[Capabilities.NLPJS_MODEL_FILE]) {
      try {
        const data = fs.readFileSync(this.caps[Capabilities.NLPJS_MODEL_FILE], 'utf8')
        this.manager.import(data)
      } catch (err) {
        throw new Error(`Failed loading model file from ${this.caps[Capabilities.NLPJS_MODEL_FILE]}: ${err.message}`)
      }
    }
    this.language = this.caps[Capabilities.NLPJS_LANGUAGE]
  }

  async Start () {
    debug('Start called')
    this.context = {}
  }

  async UserSays (msg) {
    const nlpResult = await this.manager.process(this.language, msg.messageText, this.context)
    debug(`NLPJs processing (${this.language}): "${msg.messageText}" => ${JSON.stringify(nlpResult, null, 2)}`)

    const structuredResponse = {
      sender: 'bot',
      messageText: nlpResult.answer,
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
    this.manager = null
  }
}

module.exports = BotiumConnectorNLPjs
