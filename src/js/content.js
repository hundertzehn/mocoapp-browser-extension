import React from 'react'
import ReactDOM from 'react-dom'
import Bubble from './components/Bubble'
import { createMatcher, createEnhancer } from 'utils/urlMatcher'
import remoteServices from './remoteServices'
import { pipe } from 'lodash/fp'
import { ErrorBoundary } from 'utils/notifier'
import { errorHandler } from 'utils/browserAction'
import '../css/content.scss'

const matcher = createMatcher(remoteServices)

chrome.runtime.onMessage.addListener(({ type, payload }, sender, sendResponse) => {
  switch (type) {
    case 'mountBubble': {
      console.log('MOUNT-BUBBLE')
      const settings = payload
      const service = pipe(matcher, createEnhancer(document))(window.location.href)
      if (!service.id) {
        return unmountBubble()
      }
      sendResponse(service)
      return mountBubble({ service, settings })
    }

    case 'unmountBubble': {
      return unmountBubble()
    }
  }
})

const mountBubble = ({ service, settings }) => {
  if (!document.getElementById('moco-bx-root')) {
    const domRoot = document.createElement('div')
    domRoot.setAttribute('id', 'moco-bx-root')
    document.body.appendChild(domRoot)
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Bubble service={service} settings={settings} />
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
