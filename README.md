# Botium Connector for NLP.js

[![NPM](https://nodei.co/npm/botium-connector-nlpjs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/botium-connector-nlpjs/)

[![Codeship Status for codeforequity-at/botium-connector-nlpjs](https://app.codeship.com/projects/153297c0-f6a5-0137-a0df-2661092faec2/status?branch=master)](https://app.codeship.com/projects/376435)
[![npm version](https://badge.fury.io/js/botium-connector-nlpjs.svg)](https://badge.fury.io/js/botium-connector-nlpjs)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

This is a [Botium](https://github.com/codeforequity-at/botium-core) connector for testing your [NLP.js](https://github.com/axa-group/nlp.js) models.

__Did you read the [Botium in a Nutshell](https://medium.com/@floriantreml/botium-in-a-nutshell-part-1-overview-f8d0ceaf8fb4) articles? Be warned, without prior knowledge of Botium you won't be able to properly use this library!__

## How it works
Botium uses the [NLP Manager](https://github.com/axa-group/nlp.js/blob/master/docs/nlp-manager.md) to load an existing model file from disc.

It can be used as any other Botium connector with all Botium Stack components:
* [Botium CLI](https://github.com/codeforequity-at/botium-cli/)
* [Botium Bindings](https://github.com/codeforequity-at/botium-bindings/)
* [Botium Box](https://www.botium.at)

This connector processes info about NLP, so [Intent/Entity asserters](https://botium.atlassian.net/wiki/spaces/BOTIUM/pages/17334319/NLP+Asserter+Intents+Entities+Confidence) can be used (see samples).

## Requirements
* **Node.js and NPM**
* a **an NLP.js model**
* a **project directory** on your workstation to hold test cases and Botium configuration

## Install Botium and NLP.js Connector

When using __Botium CLI__:

```
> npm install -g botium-cli
> npm install -g botium-connector-nlpjs
> botium-cli init
> botium-cli run
```

When using __Botium Bindings__:

```
> npm install -g botium-bindings
> npm install -g botium-connector-nlpjs
> botium-bindings init mocha
> npm install && npm run mocha
```

When using __Botium Box__:

See [Botium Wiki](https://botium.atlassian.net/wiki/spaces/BOTIUM/pages/38502401/Howto+develop+your+own+Botium+connector#Using-custom-connector-with-Botium-Box) how to install a connector to Botium Box.

## How to start sample

There is a small demo in [samples/hello dir](./samples/hello) with Botium Bindings. A simple NLP.js model is trained and used in the tests:

```
> cd ./samples/hello
> npm install && npm run train && npm test
```

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __npmjs__ to activate this connector.

### NLPJS_LANGUAGE
_Default: en_

Language code of your model and your test cases

### NLPJS_MODEL_OBJECT
Precompiled exported NLP.js model

### NLPJS_MODEL_FILE
Filename to load the NLP.js model from
