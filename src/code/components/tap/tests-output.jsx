import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

// Components
import TestsStats from 'components/tap/tests-stats'
import TestsFailures from 'components/tap/tests-failures'
import TestsList from 'components/tap/tests-list'

// Enums
import {
	TAP_MESSAGE_TYPE,
	TAP_COLOR,
} from 'ducks/tap'

class TestsOutput extends PureComponent {
	render() { return (
		<div>
			<TestsStats />
			<TestsFailures />
			<TestsList />
		</div>
	)}
}

export default connect(({ tap }) => ({
	failures: tap.failures,
}))(TestsOutput)
