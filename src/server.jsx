import React from 'react'
import { renderToString } from 'react-dom/server'
import { ServerRouter as Router, createServerRenderContext } from 'react-router-dom'
import { Provider } from 'react-redux'
import { compose, createStore } from 'redux'

// Polyfills
import 'utils/polyfills'
import { getInitialState } from 'utils/initial-state'
import renderFullPage from 'utils/render-full-page'

// Components
import Routes from 'routes'

// Actions
import { updatePageMeta } from 'ducks/location'

// Reducers & Routes
import rootReducer from 'ducks'

module.exports = (req, res) => {
	const context = createServerRenderContext()
	const result = context.getResult()

	if (result.redirect) {
		res.redirect(301, result.redirect.pathname + result.redirect.search)
		return
	}

	const initialState = getInitialState()
	const store = compose()(createStore)(rootReducer, initialState)

	const renderedContent = renderToString(
		<Provider store={store}>
			<Router
				location={req.url}
				context={context}
			>
				<Routes />
			</Router>
		</Provider>
	)

	store.dispatch(updatePageMeta(req.originalUrl))
	const renderedPage = renderFullPage(renderedContent, store.getState())

	if (result.missed) {
		res.status(404).send(renderedPage).end()

	} else {
		res.status(200).send(renderedPage).end()
	}
}
