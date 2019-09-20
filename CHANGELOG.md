# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Add support for starting/stopping a timer
- Show hours as HH:MM or decimal in the Bubble, depending on setting in MOCO

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
