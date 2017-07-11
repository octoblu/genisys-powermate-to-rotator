#!/usr/bin/env node
const OctoDash = require('octodash')
const packageJSON = require('./package.json')
const PowermateToRotator = require('./lib/powermate-to-rotator')

const CLI_OPTIONS = [
  {
    names: ['powermate-url'],
    type: 'string',
    required: true,
    env: 'GENISYS_POWERMATE_TO_ROTATOR_POWERMATE_URL',
    help: "The URL to the powermate websocket",
    helpArg: 'URL',
    default: 'http://localhost:52052',
  },
  {
    names: ['rotator-url'],
    type: 'string',
    required: true,
    env: 'GENISYS_POWERMATE_TO_ROTATOR_ROTATOR_URL',
    help: "The URL to the rotator server",
    helpArg: 'URL',
    default: 'http://localhost:5050',
  }
]

class PowermateToRotatorCommand {
  constructor({ argv, cliOptions = CLI_OPTIONS } = {}) {
    this.octoDash = new OctoDash({
      argv,
      cliOptions,
      name: packageJSON.name,
      version: packageJSON.version,
    })
  }

  run() {
    const { powermateUrl, rotatorUrl } = this.octoDash.parseOptions()
    console.log({powermateUrl, rotatorUrl})
    const powermateToRotator = new PowermateToRotator({powermateUrl, rotatorUrl})
    return powermateToRotator.connect()
  }

  die(error) {
    this.octoDash.die(error)
  }
}

const command = new PowermateToRotatorCommand({ argv: process.argv })
command
  .run()
  .catch((error) => {
    command.die(error)
  })
  .then(() => {
    process.exit(0)
  })
