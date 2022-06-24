module.exports = {
	displayName: 'middleware-async',
	moduleFileExtensions: ['ts', 'js'],
	verbose: true,
	collectCoverageFrom: ['<rootDir>/index.ts'],
	transform: {'^.+\\.(ts)$': 'babel-jest'},
	testMatch: ['<rootDir>/test/*.test.ts'],
	testEnvironment: 'node'
}
