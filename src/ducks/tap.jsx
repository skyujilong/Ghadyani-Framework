// --------------------------------------------------------
// Actions
// --------------------------------------------------------

const SET_TAP_START_TIME = 'SET_TAP_START_TIME'
const ADD_TAP_MESSAGE = 'ADD_TAP_MESSAGE'
const ADD_TAP_FAILURE = 'ADD_TAP_FAILURE'


// --------------------------------------------------------
// Action Creators
// --------------------------------------------------------

export const setTapStartTime = () => ({
	type: SET_TAP_START_TIME,
	startTime: new Date(),
})

export const addTapMessage = message => ({
	type: ADD_TAP_MESSAGE,
	message,
})

export const addTapFailure = message => ({
	type: ADD_TAP_FAILURE,
	message,
})


// --------------------------------------------------------
// Values & Helper Functions
// --------------------------------------------------------

const SECOND_IN_MILLISECONDS = 1000

export const TAP_START_REGEX = /^TAP version \d+$/
export const TAP_MESSAGE_REGEX = /^((ok|not ok|(# (ok|tests|pass|fail)?))[ ]*)(.+)$/
export const TAP_TEST_INFO_REGEX = /^(\d+)[ ](.+)$/
export const TAP_FAILURE_REGEX = /^((\s{4}(operator|expected|actual|stack):)|\s{6})[ ]*(.+)$/

const Enum = () => ({})
export const TAP_MESSAGE_TYPE = {
	HEADER: Enum(),
	PASS: Enum(),
	FAIL: Enum(),
}

export const TAP_COLOR = {
	FAIL: 'crimson',
	INFO: 'dimgrey',
	PASS: 'green',
}

const getFailureInfo = message => message.match(TAP_FAILURE_REGEX)

const getMessageInfo = message => {
	const [ , , identifier, , , messageText] = message.match(TAP_MESSAGE_REGEX) || []

	return {
		identifier,
		messageText,
	}
}

const getTestInfo = string => {
	const [_, testNumber, text] = string.match(TAP_TEST_INFO_REGEX)

	return {
		testNumber: Number(testNumber),
		text,
	}
}

const isSuccessfulEndMessage = message => message === '# ok'

const messageMatchesIdentifier = (
	identifier => ({ messageIdentifier }) => (
		identifier === messageIdentifier
	)
)

const tapCountActions = {
	'# fail': count => ({
		numFailed: Number(count),
		testsComplete: true,
	}),

	'# ok': () => ({
		testsComplete: true,
	}),

	'# pass': count => ({
		numPassed: Number(count),
	}),

	'# tests': count => ({
		numTotal: Number(count),
	}),
}

const tapTestActions = {
	'# ': ({ tests }, text) => ({
		tests: (
			tests
			.concat({
				text,
				type: TAP_MESSAGE_TYPE.HEADER,
			})
		)
	}),

	'not ok': ({ numFailed, numTotal, tests }, messageText) => ({
		numFailed: numFailed + 1,
		numTotal: numTotal + 1,
		tests: (
			tests
			.concat({
				...getTestInfo(messageText),
				type: TAP_MESSAGE_TYPE.FAIL,
			})
		),
	}),

	'ok': ({ numPassed, numTotal, tests }, messageText) => ({
		numPassed: numPassed + 1,
		numTotal: numTotal + 1,
		tests: (
			tests
			.concat({
				...getTestInfo(messageText),
				type: TAP_MESSAGE_TYPE.PASS,
			})
		),
	}),
}

const getParseActions = parseActions => (
	Object
	.keys(parseActions)
	.map(
		messageIdentifier => ({
			messageIdentifier,
			parseAction: parseActions[messageIdentifier]
		})
	)
)

const tapCountParseActions = getParseActions(tapCountActions)
const tapTestParseActions = getParseActions(tapTestActions)


// --------------------------------------------------------
// Reducer
// --------------------------------------------------------

export const getInitialState = () => ({
	duration: 0,
	failures: [],
	numFailed: 0,
	numPassed: 0,
	numTotal: 0,
	tests: [],
	testsComplete: false,
})

const reducer = {
	[SET_TAP_START_TIME]: (
		(state, { startTime }) => ({
			...state,
			startTime,
		})
	),

	[ADD_TAP_MESSAGE]: (
		(state, { message }) => {
			const { startTime } = state
			const endTime = new Date()
			const duration = (endTime - startTime) / SECOND_IN_MILLISECONDS

			const { identifier, messageText } = getMessageInfo(message)

			const [tapCounts] = (
				tapCountParseActions
				.filter(messageMatchesIdentifier(identifier))
				.map(({ parseAction }) => parseAction(messageText))
			)

			const [tapTests] = (
				tapTestParseActions
				.filter(messageMatchesIdentifier(identifier))
				.map(({ parseAction }) => parseAction(state, messageText))
			)

			const successfulEndState = (
				isSuccessfulEndMessage(message)
				&& tapCountActions[message]
			)

			return {
				...state,
				...tapCounts,
				...(successfulEndState || tapTests),
				duration,
				endTime,
			}
		}
	),

	[ADD_TAP_FAILURE]: (state, { message }) => {
		const newState = { ...state }
		const failureInfo = getFailureInfo(message)

		const failureType = failureInfo[3]
		const failureReason = failureInfo[4]

		newState.failures = state.failures.slice()

		if (failureType) {
			if (failureType === 'operator') {
				newState.failures.push({ [failureType]: failureReason })

			} else {
				newState.failures[newState.failures.length - 1][failureType] = failureReason
			}

		} else {
			const prevFailure = newState.failures.pop()

			if (prevFailure.expected === '|-') {
				prevFailure.expected = failureReason

			} else if (prevFailure.actual === '|-') {
				prevFailure.actual = failureReason

			} else if (prevFailure.stack === '|-') {
				prevFailure.stack = `${failureReason}\n`

			} else {
				prevFailure.stack += `  ${failureReason}\n`
			}

			newState.failures.push(prevFailure)
		}

		return { ...newState }
	},
}

const fpReducer = (reducer, initialState) => (state = initialState, action) => (
	reducer[action.type]
	? reducer[action.type](state, action)
	: state
)

export default fpReducer(reducer, getInitialState())
