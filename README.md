mocoapp-browser-extension
=========================

Documentation
-------------

* https://checklyhq.com/blog/2018/08/creating-a-chrome-extension-in-2018-the-good-the-bad-and-the-meh/
* https://developer.chrome.com/extensions
* https://developer.chrome.com/extensions/api_index

Development
-----------

* run `yarn`
* run `yarn start:chrome` or `yarn start:firefox` (`yarn start` is an alias for `yarn start:chrome`)
* load extension into browser:
  * Chrome: visit `chrome://extensions` and load unpacked extension from `build/chrome`
  * Firefox: visit `about:debugging` and load temporary Add-on from `build/firefox`
* reload browser extension after change

Release
-------

* bump version in `package.json`
* run `yarn build`
* upload Chrome and Firefox extensions in `build/chrome` and `build/firefox` respectively
