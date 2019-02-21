import React from 'react'
import ReactDOM from 'react-dom'
import Bubble from './components/Bubble'
import { createMatcher, createEnhancer } from 'utils/urlMatcher'
import remoteServices from './remoteServices'
import { pipe } from 'lodash/fp'
import { ErrorBoundary } from 'utils/notifier'
import '../css/content.scss'

const matcher = createMatcher(remoteServices)
const enhancer = createEnhancer(window.document)

chrome.runtime.onMessage.addListener(({ type, payload }) => {
  switch (type) {
    case 'mountBubble': {
      return mountBubble(payload)
    }

    case 'unmountBubble': {
      return unmountBubble()
    }
  }
})

const mountBubble = (settings) => {
  const service = pipe(
    matcher,
    enhancer(window.location.href)
  )(window.location.href)

  if (!service) {
    return
  }

  if (!document.getElementById('moco-bx-root')) {
    const domRoot = document.createElement('div')
    domRoot.setAttribute('id', 'moco-bx-root')
    document.body.appendChild(domRoot)
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Bubble service={service} settings={settings} browser={chrome} />
    </ErrorBoundary>,
    document.getElementById('moco-bx-root')
  )
}

const unmountBubble = () => {
  const domRoot = document.getElementById('moco-bx-root')

  if (domRoot) {
    ReactDOM.unmountComponentAtNode(domRoot)
    domRoot.remove()
  }
}
