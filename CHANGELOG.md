# Changelog

## [0.2.2](https://github.com/KalebGore28/CSC530-COBIS-Project/compare/v0.2.1...v0.2.2) (2026-11-04)


### Bug Fixes

* hide GPA from admin assistants on student lookup ([#44](https://github.com/KalebGore28/CSC530-COBIS-Project/issues/44)) ([88dc593](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/88dc59358b998701a001da8d0185649d356a8a6e))

## [0.2.1](https://github.com/KalebGore28/CSC530-COBIS-Project/compare/v0.2.0...v0.2.1) (2026-11-03)


### Performance Improvements

* keep collections fresh longer so going back doesn't refetch them ([d82fbe2](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/d82fbe2343ce750cde4ef0931aafe1d08ca82221))

## [0.2.0](https://github.com/KalebGore28/CSC530-COBIS-Project/compare/v0.1.1...v0.2.0) (2026-11-03)


### Features

* redesigned advisees page ([b1f7a13](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/b1f7a13ad6b4b8f349c5d0929d1f1fbc77bd6506))
* redesigned class roster page ([d7f373d](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/d7f373dc3637a5d83707213ad7646131451fb36c))
* redesigned dashboard ([7834673](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/78346731696221e5a83a6b06ddbf3cf763ea2069))
* redesigned instructor page ([420df71](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/420df7158d029dc5558f2173a2641300ba64dff1))
* redesigning enrollment page for better metrics ([b887406](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/b8874063c753666ce5e6aecb67441b915b40addb))
* redesigning student lookup ([cee1097](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/cee10978eff9a6d7bbefcb9ad537b50c1a133de3))

## [0.1.1](https://github.com/KalebGore28/CSC530-COBIS-Project/compare/v0.1.0...v0.1.1) (2026-11-03)


### Bug Fixes

* adding safe parse for boolean values in csv ([cdfa084](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/cdfa084047a75d4bbda18406d28279ed717ddc4a))
* beginning fixes ([1f5d445](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/1f5d445b03e2d5fb92ec52c97391bb8d465599cb))
* bug fixes and improvements to csv importer ([51fd86f](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/51fd86f443aabcfc90719c2b6c07648055f53151))
* continued migration of permission checks ([1806d2e](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/1806d2e80e97c0b7878b6d8762e658c4a7dcd22c))
* fixed login errors and dashboard ([62c636c](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/62c636cc9e278ffb20fc53c877538cacf8cc6c86))
* migrate tables to react-table v9 and resolve collections via db client ([81d4c32](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/81d4c3208689953c11190c5630e8ba334fbd86ee))
* migrating tanstack db code ([7e4d4d2](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/7e4d4d2f7fad56048f59cb8833ce5c6a1a4f3a4b))
* migrating tanstack db collection state ([2accdf4](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/2accdf47d94a33c1283a22866f641322d4b18ed7))
* minor fixes to user modal ([4846bea](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/4846bea77fe3ff0c3b1fd496e4c441cc22878444))
* reworking collection preloads and wiring up new checks ([b123ce8](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/b123ce812ec111af4c608c4ca7066b632cd3c50f))
* reworking editable table component ([af817df](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/af817df53e4fb30279b2b0efa940afb965b5a291))
* small fixes ([ef7a3ab](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/ef7a3ab63a1a4428d47729f0c01a9fd3f8c71a72))
* tweaked collection preloading ([9d630a1](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/9d630a187ab7d619e32202a8c80487e8420c6292))


### Performance Improvements

* added indexing to collections ([9b483c1](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/9b483c1db82d008357edbf6492dc2e4a33198c11))

## [0.1.0](https://github.com/KalebGore28/CSC530-COBIS-Project/compare/v0.0.2...v0.1.0) (2026-05-29)


### Features

* added import history page with job tracking ([c9080b0](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/c9080b00765be6c8822c764338c9104d35170b69))
* Import flow overhaul with progress tracking and history ([#32](https://github.com/KalebGore28/CSC530-COBIS-Project/issues/32)) ([c9080b0](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/c9080b00765be6c8822c764338c9104d35170b69))
* improved import processing with better error handling ([c9080b0](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/c9080b00765be6c8822c764338c9104d35170b69))
* streaming import progress with live updates ([c9080b0](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/c9080b00765be6c8822c764338c9104d35170b69))


### Bug Fixes

* added transaction for imports ([c9080b0](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/c9080b00765be6c8822c764338c9104d35170b69))
* import flow stability improvements ([c9080b0](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/c9080b00765be6c8822c764338c9104d35170b69))

## [0.0.2](https://github.com/KalebGore28/CSC530-COBIS-Project/compare/v0.0.1...v0.0.2) (2026-04-29)


### Bug Fixes

* updating TanstackDB integrations ([#30](https://github.com/KalebGore28/CSC530-COBIS-Project/issues/30)) ([7cfdf47](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/7cfdf4706661634c17d3eec1c32c05db3d2ea17a))

## [0.0.1](https://github.com/KalebGore28/CSC530-COBIS-Project/compare/v0.0.0...v0.0.1) (2026-04-28)


### Bug Fixes

* update package configuration ([508b968](https://github.com/KalebGore28/CSC530-COBIS-Project/commit/508b9683115a3d8fdcdc976ea159d81d25f367ce))
