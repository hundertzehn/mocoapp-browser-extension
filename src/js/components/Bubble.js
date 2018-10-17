import React, { Component, Fragment } from 'react'
import Modal, { Content } from 'components/Modal'
import Form from 'components/Form'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

@observer
class Bubble extends Component {
  @observable open = false

  onOpen = (_e) => {
    this.open = true
  }

  onClose = (_e) => {
    this.open = false
  }

  // RENDER -------------------------------------------------------------------

  render() {
    return (
      <Fragment>
        <img
          onClick={this.onOpen}
          src={chrome.extension.getURL('src/images/logo.png')}
          width="50%"
        />

        {this.open &&
          <Modal>
            <Content>
              <Form />
              <button onClick={this.onClose}>Close</button>
            </Content>
          </Modal>
        }
      </Fragment>
    )
  }
}

export default Bubble
