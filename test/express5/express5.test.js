const fetch = require('node-fetch')
const express = require('express')
const {createServer} = require('http')

describe('express 5', () => {
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
	test('call order of async middlewares', async () => {
		let orders = ''
		app.get(
			'/',
			async (req, res, next) => {
				orders += '1'
				await next()
				orders += '2'
			},
			async (req, res) => {
				await new Promise(resolve => setTimeout(resolve, 500))
				orders += '3'
				res.status(200).send('1')
			},
		)
		const res = await fetch(url)
		expect(await res.text()).toBe('1')
		expect(orders).toBe('123')
		// TODO: should be 132
		// expect(orders).toBe('132')
	})
	test('reject if a reject promise is returned in middleware', async () => {
		app.get(
			'/',
			() => {
				return Promise.reject(new Error('1'))
			},
			(err, req, res, next) => {
				res.send('2')
			},
		)
		const res = await fetch(url)
		expect(await res.text()).toBe('2')
	})
})
