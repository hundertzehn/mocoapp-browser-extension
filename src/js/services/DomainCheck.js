class DomainCheck {
  constructor(url) {
    this.url = url
  }

  get hasMatch() {
    return this.url.match(/github/) || this.url.match(/trello/) || this.url.match(/mocoapp/)
  }
}

export default DomainCheck
