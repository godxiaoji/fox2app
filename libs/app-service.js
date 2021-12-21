import appOptions from '@/app.js'
const pageCtx = require.context('@/pages/', true, /\.js$/)
const compCtx = require.context('@/components/', true, /\.js$/)
__$.serviceLoad({ pageCtx, compCtx, appOptions })
