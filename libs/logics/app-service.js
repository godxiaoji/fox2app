import appOptions from '../src/app.js'
const pageCtx = require.context('../src/pages', true, /\.js$/)
const compCtx = require.context('../src/components', true, /\.js$/)

__$.serviceLoad({ pageCtx, compCtx, appOptions })