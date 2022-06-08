# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.1](https://github.com/BlackGlory/extra-native-websocket/compare/v0.3.0...v0.3.1) (2022-06-08)

## [0.3.0](https://github.com/BlackGlory/extra-native-websocket/compare/v0.2.2...v0.3.0) (2022-06-08)


### ⚠ BREAKING CHANGES

* addEventListener, removeEventListener are removed

* use Emitter from @blackglory/structures ([e4f9bca](https://github.com/BlackGlory/extra-native-websocket/commit/e4f9bca9d956c1046bccd4833003328ba50f69d1))

### [0.2.2](https://github.com/BlackGlory/extra-native-websocket/compare/v0.2.1...v0.2.2) (2022-06-03)


### Features

* add autoReconnectWithExponentialBackOff ([9392273](https://github.com/BlackGlory/extra-native-websocket/commit/9392273ede84b42112a1ae09246d2bffc6d1e02c))

### [0.2.1](https://github.com/BlackGlory/extra-native-websocket/compare/v0.2.0...v0.2.1) (2022-06-02)


### Bug Fixes

* **autoReonnect:** remove the close event listener before reconnection ([5152d47](https://github.com/BlackGlory/extra-native-websocket/commit/5152d47be6f02d1447bdffd45d97ccfbf01f3888))

## [0.2.0](https://github.com/BlackGlory/extra-native-websocket/compare/v0.1.0...v0.2.0) (2022-05-31)


### ⚠ BREAKING CHANGES

* previously unsent messages will be sent after connecting

### Features

* previously unsent messages will be sent after connecting ([1ac535a](https://github.com/BlackGlory/extra-native-websocket/commit/1ac535a0cb3364d1393930adbff2b204d0c9e2ed))

## 0.1.0 (2022-05-30)


### Features

* init ([04243e0](https://github.com/BlackGlory/extra-native-websocket/commit/04243e0c086572a595eae340de7f20a8e5997fc5))
