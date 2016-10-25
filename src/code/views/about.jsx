import React, { PureComponent } from 'react'
import { Link } from 'react-router'

// Components
import Sample from 'components/sample'

// Utilities
import StylesLoader from 'utilities/styles-loader'

const stylesLoader = StylesLoader.create()

class About extends PureComponent {
	render() { return (
		<div>
			<h1>About</h1>
			<Sample />

			<Link to="/" title="Go to Home">Home</Link>
		</div>
	)}
}

module.exports = stylesLoader.render(About)
