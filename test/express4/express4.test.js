const fetch = require('node-fetch')
const express = require('express')
const {createServer} = require('http')

describe('express 4', () => {
	let tcpServer
	let app
	let url
	beforeEach(async () => {
		tcpServer = createServer()
		app = express()
		tcpServer.on('request', app)
		await new Promise(resolve => tcpServer.listen(0, resolve))
		url = `http://localhost:${tcpServer.address().port}`
	})
	afterEach(async () => {
		tcpServer.off('request', app)
		await new Promise(resolve => tcpServer.close(resolve))
	})
	test('response to a request and finish at the first send', async () => {
		let orders = ''
		app.get(
			'/',
			(req, res, next) => {
				res.status(200).send('1')
				orders += '1'
				next()
				orders += '2'
				res.status(200).send('2')
			},
			(req, res) => {
				orders += '3'
				res.status(200).send('3')
			},
		)
		const res = await fetch(url)
		expect(await res.text()).toBe('1')
		expect(orders).toBe('132')
	})
	test('reject if an error is thrown in middleware', async () => {
		app.get(
			'/',
			() => {
				throw new Error('1')
			},
			(err, req, res, next) => {
				res.send('2')
			},
		)
		const res = await fetch(url)
		expect(await res.text()).toBe('2')
	})
})
