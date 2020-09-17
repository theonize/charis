const updater = require('./updateCharis')
const stuff = require('./charisUpdate.json')

for (const thing of stuff) updater.update(...thing)

updater.save()