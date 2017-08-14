const debug = require('debug')('genisys-powermate-to-rotator')
const { EventEmitter } = require('events')
const bindAll = require('lodash/fp/bindAll')
const get = require('lodash/fp/get')
const WebSocket = require('ws')
const _ = require('lodash')
const request = require('request')

class PowermateToRotator extends EventEmitter {
  constructor ({ powermateUrl, rotatorUrl }) {
    super()
    bindAll(Object.getOwnPropertyNames(PowermateToRotator.prototype), this)

    this.powermateUrl = powermateUrl
    this.rotatorUrl = rotatorUrl
  }

  close() {
    if (!this.ws) return
    this.ws.close()
    delete this.ws
  }

  connect() {
    this.ws = new WebSocket(this.powermateUrl)
    const waitAndConnectOnce = _.once(this._waitAndConnect)
    this.ws.on('message', this._onPowermateMessage)
    this.ws.on('error', waitAndConnectOnce)
    this.ws.on('close', waitAndConnectOnce)
    this.ws.on('open', () => this.emit('open'))
  }

  _onPowermateMessage(messageStr) {
    let message

    try {
      message = JSON.parse(messageStr)
    } catch (error) {
      debug('_onPowermateMessage JSON parse error', messageStr, error.stack)
      this.emit('error', error)
      return
    }

    const action = get('data.action', message)

    if (action === 'rotateLeft') {
      return this._rotate('previous')
    }

    if (action === 'rotateRight') {
      return this._rotate('next')
    }
  }

  _rotate(direction) {
    const options = {
      baseUrl: this.rotatorUrl,
      uri: direction,
    }

    request.post(options, (error) => {
      if (error) {
        debug(`Error trying to post to the rotator: ${error.message}`)
        this.emit('error', error)
      }
    })
  }

  _waitAndConnect() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
    }

    this.timeoutHandle = setTimeout(this.connect, 1000)
  }
}

module.exports = PowermateToRotator
