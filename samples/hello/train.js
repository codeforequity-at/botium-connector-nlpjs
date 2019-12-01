const { NlpManager } = require('node-nlp')

const manager = new NlpManager({ languages: ['en'] })

manager.addDocument('en', 'goodbye for now', 'greetings.bye')
manager.addDocument('en', 'bye bye take care', 'greetings.bye')
manager.addDocument('en', 'okay see you later', 'greetings.bye')
manager.addDocument('en', 'bye for now', 'greetings.bye')
manager.addDocument('en', 'i must go', 'greetings.bye')
manager.addDocument('en', 'hello', 'greetings.hello')
manager.addDocument('en', 'hi', 'greetings.hello')
manager.addDocument('en', 'howdy', 'greetings.hello')
manager.addAnswer('en', 'greetings.bye', 'Till next time')
manager.addAnswer('en', 'greetings.bye', 'see you soon!')
manager.addAnswer('en', 'greetings.hello', 'Hey there!')
manager.addAnswer('en', 'greetings.hello', 'Greetings!')

manager.addNamedEntityText(
  'hero',
  'spiderman',
  ['en'],
  ['Spiderman', 'Spider-man']
)
manager.addNamedEntityText(
  'hero',
  'iron man',
  ['en'],
  ['iron man', 'iron-man']
)
manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor'])
manager.addNamedEntityText(
  'food',
  'burguer',
  ['en'],
  ['Burguer', 'Hamburguer']
)
manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza'])
manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti'])
manager.addDocument('en', 'I saw %hero% eating %food%', 'sawhero')
manager.addDocument(
  'en',
  'I have seen %hero%, he was eating %food%',
  'sawhero'
)
manager.addDocument('en', 'I want to eat %food%', 'wanteat');

// Train and save the model.
(async () => {
  await manager.train()
  manager.save('./model.nlp')
})()
