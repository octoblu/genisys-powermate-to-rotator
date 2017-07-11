const bindAll   = require('lodash/fp/bindAll')
const get       = require('lodash/fp/get')
const WebSocket = require('ws')
const _         = require('lodash')
class PowermateToRotator {
  constructor ({powermateUrl, rotatorUrl}) {
    bindAll(Object.getOwnPropertyNames(PowermateToRotator.prototype), this)
    this.powermateUrl = powermateUrl
    this.rotatorUrl   = rotatorUrl
  }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.powermateUrl)
      ws.on('message', this._onPowermateMessage)
      ws.on('connect', resolve)
      ws.on('error', reject)
    })
  }

  _onPowermateMessage(message) {

    try {
      message = JSON.parse(message)
    }

    catch(error) {
      console.log(error.message)
      return
    }

    const action = get('data.action',message)

    if (action === 'rotateLeft') {
      return this._rotatePrevious()
    }

    if (action === 'rotateRight') {
      return this._rotateNext()
    }

  }

  _rotatePrevious() {
    console.log('_rotatePrevious')
  }

  _rotateNext() {
    console.log('_rotateNext')
  }

}

module.exports = PowermateToRotator
