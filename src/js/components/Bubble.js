import React, { Component } from "react"
import Modal, { Content } from "components/Modal"
import Form from "components/Form"
import { observable } from "mobx"
import { observer } from "mobx-react"
import logoUrl from "../../images/logo.png"

@observer
class Bubble extends Component {
  @observable open = false

  onOpen = _event => {
    this.open = true
  }

  onClose = _event => {
    this.open = false
  }

  componentDidMount() {
    console.log(this.props.service)
  }

  // RENDER -------------------------------------------------------------------

  render() {
    return (
      <>
        <img
          onClick={this.onOpen}
          src={chrome.extension.getURL(logoUrl)}
          width="50%"
        />

        {this.open && (
          <Modal>
            <Content>
              <Form />
              <button onClick={this.onClose}>Close</button>
            </Content>
          </Modal>
        )}
      </>
    )
  }
}

export default Bubble
