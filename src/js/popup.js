console.log("okish from popup.js")

import React, { createElement } from 'react'
import ReactDOM from 'react-dom'
import Modal from './components/Modal'

const domContainer = document.querySelector('#moco')
ReactDOM.render(createElement(Modal), domContainer)
