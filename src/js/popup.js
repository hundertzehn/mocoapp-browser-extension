import { createElement } from 'react'
import ReactDOM from 'react-dom'
import Form from './components/Form'

const domContainer = document.querySelector('#moco-bx-container')
ReactDOM.render(createElement(Form, {inline: false}), domContainer)
