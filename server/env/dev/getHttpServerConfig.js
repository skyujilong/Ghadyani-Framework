const bodyParser = require('body-parser')
const express = require('express')

const basePath = require('server/utils/basePath')
const config = require('config')
const loadHtmlRenderer = require('server/utils/loadHtmlRenderer')
const paths = require('server/utils/paths')
const sendEmail = require('server/middleware/sendEmail')

require('server/utils/loadBabelNodeConfig')()

const loadSite = (req, res) => (
	loadHtmlRenderer({
		args: [undefined, { pageMeta: {} }],
		filename: `${paths.root.src}renderers/renderSite`,
		res,
	})
)

const loadTests = (req, res) => (
	loadHtmlRenderer({
		args: [res],
		filename: `${paths.root.src}renderers/renderTests`,
		res,
	})
)

const httpServerConfig = express()

httpServerConfig
.use(
	express.static(
		`${basePath}/${paths.root.dest}`,
		{ redirect: false }
	)
)

.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: false }))

.get(config.getTestsPath(), loadTests)
.get(`${config.getTestsPath()}/:testName`, loadTests)

.post(config.getMailSendPath(), sendEmail)

.all('*', loadSite)

module.exports = () => httpServerConfig