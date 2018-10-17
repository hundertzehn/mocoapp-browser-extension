import { createElement } from 'react'
import ReactDOM from 'react-dom'
import Bubble from './components/Bubble'

// don't initiate bubble twice
if (!document.querySelector('#moco-bx-container')) {
  const domContainer = document.createElement('div')
  domContainer.setAttribute('id', 'moco-bx-container')
  document.body.appendChild(domContainer)

  const domBubble = document.createElement('div')
  domBubble.setAttribute('id', 'moco-bx-bubble')
  document.body.appendChild(domBubble)

  ReactDOM.render(createElement(Bubble), domBubble)
}
