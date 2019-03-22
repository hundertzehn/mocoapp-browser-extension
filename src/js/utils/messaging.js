export class BackgroundMessenger {
  #ports = new Map();
  #handlers = new Map();
  #onceHandlers = new Map();

  #handler = action => {
    const handler = this.#handlers.get(action.type)
    if (handler) {
      handler(action)
    }
  };

  #onceHandler = action => {
    const handler = this.#onceHandlers.get(action.type)
    this.#onceHandlers.delete(action.type)
    if (handler) {
      handler(action)
    }
  };

  #registerPort = (tabId, port) => {
    this.#ports.set(tabId, port)
    port.onMessage.addListener(this.#handler)
    port.onMessage.addListener(this.#onceHandler)
    port.onDisconnect.addListener(() => {
      this.#unregisterPort(tabId, port)
    })
  };

  #unregisterPort = (tabId, port) => {
    port.onMessage.removeListener(this.#handler)
    port.onMessage.removeListener(this.#onceHandler)
    port.disconnect()
    this.#ports.delete(tabId)
  };

  connectTab = tab => {
    const currentPort = this.#ports.get(tab.id)
    if (!currentPort) {
      const port = chrome.tabs.connect(tab.id)
      this.#registerPort(tab.id, port)
    }
  };

  disconnectTab = tabId => {
    const port = this.#ports.get(tabId)
    if (port) {
      this.#unregisterPort(tabId, port)
    }
  };

  postMessage = (tab, action) => {
    const port = this.#ports.get(tab.id)
    if (port) {
      port.postMessage(action)
    }
  };

  once = (type, handler) => {
    this.#onceHandlers.set(type, handler)
  };

  on = (type, handler) => {
    this.#handlers.set(type, handler)
  };
}

export class ContentMessenger {
  #port;
  #handlers = new Map();

  #handler = action => {
    const handler = this.#handlers.get(action.type)
    if (handler) {
      handler(action)
    }
  };

  constructor(port) {
    this.#port = port
    this.#port.onMessage.addListener(this.#handler)
  }

  postMessage = action => {
    if (this.#port) {
      this.#port.postMessage(action)
    }
  };

  on = (type, handler) => {
    this.#handlers.set(type, handler)
  };

  stop = () => {
    this.#port.onMessage.removeListener(this.#handler)
    this.#port = null
    this.#handlers.clear()
  };
}
