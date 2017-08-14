// const bodyParser = require('body-parser')
// const express = require('express')
const http = require('http')
const bindAll = require('lodash/fp/bindAll')
const enableDestroy = require('server-destroy')
const url = require('url')
const WebSocket = require('ws')
// const sinon = require('sinon')
//
class SirMockSocket {
  constructor({ port } = {}) {
    bindAll(Object.getOwnPropertyNames(SirMockSocket.prototype), this)
    this._port = port || 0
    this.server = http.createServer()
    enableDestroy(this.server)
    this.wss = new WebSocket.Server({ server: this.server })
  }

  broadcast(message) {
    this.broadcastRaw(JSON.stringify(message))
  }

  broadcastRaw(message) {
    this.wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return

      client.send(message)
    })
  }

  port() {
    return this.server.address().port
  }

  restart(callback) {
    const port = this.port()
    this.server.destroy((error) => {
      if (error) return callback(error)

      this.server.listen(port, callback)
    })
  }

  start(callback) {
    this.server.listen(this._port, callback)
  }

  stop(callback) {
    this.server.destroy(callback)
  }

  url() {
    return url.format({ protocol: 'ws', hostname: 'localhost', port: this.port() })
  }
}

module.exports = SirMockSocket
