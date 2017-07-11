const bindAll   = require('lodash/fp/bindAll')
const get       = require('lodash/fp/get')
const WebSocket = require('ws')
const _         = require('lodash')
const request   = require('request')
class PowermateToRotator {
  constructor ({powermateUrl, rotatorUrl}) {
    bindAll(Object.getOwnPropertyNames(PowermateToRotator.prototype), this)
    this.powermateUrl = powermateUrl
    this.rotatorUrl   = rotatorUrl
  }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.powermateUrl)
      const waitAndConnectOnce = _.once(this._waitAndConnect)
      ws.on('message', this._onPowermateMessage)
      ws.on('error', waitAndConnectOnce)
      ws.on('close', waitAndConnectOnce)
    })
  }

  _onPowermateMessage(message) {

    try {
      message = JSON.parse(message)
    }

    catch(error) {
      console.error( `Error receiving a message from the powermate: ${error.message}`)
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
      baseUrl:this.rotatorUrl,
      uri:direction
    }

    request.post(options, (error) =>{
      if(error){
        console.error(`Error trying to post to the rotator: ${error.message}`)
      }
    })

  }

  _rotateNext() {
    console.log('_rotateNext')
  }

  _waitAndConnect(){
    if(this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
    }

    this.timeoutHandle = setTimeout(this.connect, 1000)
  }

}

module.exports = PowermateToRotator
