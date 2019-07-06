module.exports = api => {
  api.cache(true)
  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript'
    ],
    plugins: [
      ["@babel/plugin-transform-runtime", { regenerator: true } ],
      '@babel/plugin-proposal-object-rest-spread',
    ]
  }
}
