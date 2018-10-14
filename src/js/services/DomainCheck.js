class DomainCheck {
  constructor(url) {
    this.url = url
  }

  get hasMatch() {
    return this.url.match(/github/)
  }
}

export default DomainCheck
