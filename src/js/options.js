import { createElement } from 'react'
import ReactDOM from 'react-dom'
import Setup from './components/Setup'

const domContainer = document.querySelector('#moco-bx-container')
ReactDOM.render(createElement(Setup), domContainer)
