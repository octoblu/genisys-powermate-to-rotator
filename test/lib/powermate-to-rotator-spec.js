/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */

const { afterEach, beforeEach, describe, it } = global
const { expect } = require('chai')
const shmock = require('shmock')
const url = require('url')
const SirMockSocket = require('../helpers/sir-mock-socket')
const PowermateToRotator = require('../../lib/powermate-to-rotator')

describe('PowermateToRotator', function() {
  beforeEach('powermate.start', function(done) {
    this.powermate = new SirMockSocket()
    this.powermate.start(done)
  })

  afterEach('powermate.stop', function(done) {
    this.powermate.stop(done)
  })

  describe('when sut is created with an invalid rotator server', function() {
    beforeEach('sut.start', function(done) {
      this.sut = new PowermateToRotator({ powermateUrl: this.powermate.url(), rotatorUrl: 'http://locahost:0' })
      this.sut.once('open', done)
      this.sut.connect()
    })

    describe('when the powermate emits rotateLeft', function() {
      beforeEach(function(done) {
        this.sut.on('error', (error) => {
          this.error = error
          done()
        })
        this.powermate.broadcast({ data: { action: 'rotateLeft' } })
      })

      it('should emit an error', function() {
        expect(this.error).to.exist
      })
    })
  })

  describe('when sut is created with a valid rotator server', function() {
    beforeEach('sut.start', function(done) {
      this.rotator = shmock()
      const rotatorUrl = url.format({ protocol: 'http', hostname: 'localhost', port: this.rotator.address().port })
      this.sut = new PowermateToRotator({ powermateUrl: this.powermate.url(), rotatorUrl })
      this.sut.once('open', done)
      this.sut.connect()
    })

    afterEach(function() {
      this.sut.close()
    })

    describe('when the powermate emits rotateLeft', function() {
      beforeEach(function() {
        this.postPrevious = this.rotator.post('/previous').reply(204)
        this.powermate.broadcast({ data: { action: 'rotateLeft' } })
      })

      it('should make a post request to /previous', function(done) {
        this.postPrevious.wait(100, done)
      })
    })

    describe('when the powermate emits rotateRight', function() {
      beforeEach(function() {
        this.postPrevious = this.rotator.post('/next').reply(204)
        this.powermate.broadcast({ data: { action: 'rotateRight' } })
      })

      it('should make a post request to /previous', function(done) {
        this.postPrevious.wait(100, done)
      })
    })

    describe('when the powermate emits invalidJSON', function() {
      beforeEach(function(done) {
        this.sut.on('error', (error) => {
          this.error = error
          done()
        })
        this.powermate.broadcastRaw('{Flllarg: ()foo}')
      })

      it('should emit an error', function() {
        expect(this.error).to.exist
      })
    })
  })
})
