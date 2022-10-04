# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.2] - 2022-10-04

### Fixed

- Popup cannot be opened due to too long popup URL ([Issue 570](https://github.com/hundertzehn/mocoapp-browser-extension/issues/570))

## [1.9.1] - 2022-08-22

### Fixed

- Revert back to Manifest V2

## [1.9.0] - 2022-08-15

### Fixed

- Add URL pattern for Youtrack

### Added

- Support Manifest V3 for Chrome

## [1.8.1] - 2022-08-05

### Fixed

- URL patterns fixed for Youtrack

## [1.8.0] - 2022-07-11

### Changed

- Major library upgrades

### Fixed

- URL patterns fixed for Wrike

## [1.7.7] - 2022-04-05

### Fixed

- Reduced popup height on Chrome 100

## [1.7.7] - 2022-03-29

### Fixed

- Gitlab title selector and tracking time on comment URLs (contribution by https://github.com/infabo)

### Added

- Add additional url pattern for Youtrack (":host:/issue/:id")

### Changed

- Community supported services extracted to own module `remoteServicesCommunity.js`

## [1.7.6] - 2022-03-21

### Added

- Add additional url pattern for Jira Backlogs

## [1.7.5] - 2022-03-14

### Added

- Add url pattern for Jira Backlogs

## [1.7.4] - 2022-02-10

### Added

- Support for additional URLs for Jira

## [1.7.3] - 2022-01-31

### Added

- Support for URL with comment hash for Jira

## Changed

- Increase bottom margin of MOCO-bubble on Wrike

## [1.7.2] - 2022-01-10

### Added

- Region support for Wrike

## [1.7.1] - 2021-12-06

### Changed

- Improvments to basecamp3: (community supported, contribution by Florian Jahn: https://github.com/fjahn)

## [1.7.0] - 2021-11-22

### Added

- basecamp3 service: (community supported, contribution by Florian Jahn: https://github.com/fjahn)

## [1.6.10] - 2021-08-31

### Fixed

- Fixed description field for Wrike
- Fixed description field for Jira

## [1.6.9] - 2021-07-20

### Fixed

- Fixed URL-patterns for Asana

## [1.6.8] - 2021-06-03

### Fixed

- Hide Bubble when a service is no longer available

## [1.6.7] - 2021-05-25

### Changed

- Display bubble in the bottom center in Asana

## [1.6.6] - 2021-05-25

### Fixed

- Increase bottom position of bubble in Asana so that it no longer overlaps with the controls

## [1.6.5] - 2021-05-11

### Fixed

- Set the top padding of the popup relative to the window height

## [1.6.4] - 2021-02-18

### Added

- Show tag of activity on timer view

## [1.6.3] - 2021-02-17

### Added

- Support different languages on Asana

## [1.6.2] - 2021-02-11

### Fixed

- Prefill description from Asana task name

### Added

- Add support for project folders in Gitlab (contribution by Adrian Görisch: https://github.com/adrian-goe)

## [1.6.1] - 2020-12-07

### Fixed

- Pre-selected project

## [1.6.0] - 2020-11-26

### Added

- Clickup service

### Changed

- Major library upgrades

## [1.5.2] - 2020-09-10

### Fixed

- Remember last tracked project and task on card

## [1.5.1] - 2020-08-04

### Added

- Add support for Monday: (community supported, contribution by https://github.com/markusNahketing)

## [1.5.0] - 2020-06-15

### Added

- Allow to override hosts for Jira, Youtrack and Gitlab in options (implemented by yay-digital.de)

## [1.4.0] - 2020-04-27

### Added

- Add support for Gitlab merge requests and issues: (community supported, contribution by Adrian Görisch: https://github.com/adrian-goe)

## [1.3.4] - 2020-01-09

### Added

- Asana: read task title from single task pane

## [1.3.3] - 2019-10-17

### Fixed

- Fix an issue on Trello where the card closes when clicking the MOCO bubble
- Asana: read project title from page heading

## [1.3.2] - 2019-10-24

### Added

- Read project identifier from Trello board title

## [1.3.1] - 2019-10-17

### Fixed

- Set propper focus on timer view

### Removed

- Find projects by identifier without alphanumerical characters

## [1.3.0] - 2019-10-11

### Added

- Start a new timer or stop a running timer
- Format time as set in time tracking
- Add support for project identifier in Github Issue, Trello, Wunderlist, Youtrack
- Find projects by identifier without alphanumerical characters

## [1.2.4] - 2019-09-20

### Changed

- Preselect last used task per project

## [1.2.3] - 2019-06-26

### Changed

- Description of activities are optional

## [1.2.2] - 2019-05-24

### Removed

- Bugsnag client

## [1.2.1] - 2019-05-03

### Fixed

- Support EU-hosted wrike.com (app-eu.wrike.com)

## [1.2.0] - 2019-04-26

### Added

- Add support for wrike.com

## [1.1.5] - 2019-04-24

### Fixed

- Unexpected closing of Trello card when clicking on Bubble

## [1.1.4] - 2019-04-11

### Added

- Show customer name in the project select box

## [1.1.3] - 2019-04-10

### Fixed

- Read projected identifier in Asana's "My tasks"-view

## [1.1.2] - 2019-04-06

### Fixed

- Allow production build without BUGSNAG_API_KEY
- Hours entered in brackets must be non-billable

### Changed

- Read project identifier also from card title in the meistertask service

## [1.1.1] - 2019-04-01

### Fixed

- Discard projects with undefined identifier for preselecting

## [1.1.0] - 2019-03-30

### Added

- Read project identifier from Asana project title
- Add support for meistertask.com

### Fixed

- Link logo in modal to MOCO activities page
- Set full url on service, including query params

## [1.0.22] - 2019-03-28

### Changed

- Change the default value of subdomain to `unset` to have a well-formed URL.

## [1.0.21] - 2019-03-26

### Changed

- Update README with example configuration and instructions for local installation

## [1.0.20] - 2019-03-26

### Added

- Add support for tags in description

## [1.0.19] - 2019-03-26

### Changed

- Position Bubble in the bottom right by default

### Fixed

- Set default value of subdomain to `__unset__` to prevent network error if it is empty

## [1.0.18] - 2019-03-23

### Added

- First release of version 1
