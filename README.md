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
* run `yarn webpack --watch`
* load unpacked extension in Chrome (ignore node_modules errors)
* reload Chrome extension after change

Release
-------

* bump version in `manifest.json`
* bump version in `package.json`
* run `yarn release`
* zip contents in `/release`
* upload Chrome extension
