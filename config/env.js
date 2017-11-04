const processEnvConfigValues = {
	HOSTNAME: 'hostname',
	LOCAL_DEVELOPMENT: 'localDevelopment',
	MAIL_FROM: 'mailFrom',
	MAIL_SEND_PATH: 'mailSendPath',
	NODE_ENV: 'env',
	PORT: 'port',
	PROTOCOL: 'protocol',
	PROXY_HOSTNAME: 'proxyHostname',
	PROXY_PORT: 'proxyPort',
	SMTP_CREDENTIALS: 'smtpCredentials',
	TESTS_PATH: 'testsPath',
}

const createConfigObject = (acc, { key, value }) => ({
	...acc,
	[key]: value
})

const getProcessEnvValue = key => ({
	key: processEnvConfigValues[key],
	value: process.env[key],
})

const hasValue = ({ value }) => typeof value !== 'undefined'

module.exports = (
	Object
	.keys(processEnvConfigValues)
	.map(getProcessEnvValue)
	.filter(hasValue)
	.reduce(createConfigObject, {})
)
