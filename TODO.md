## Frontend integration

* Creating notes
* Updating notes
* Deleting notes
* Creating notebooks
* Creating tags
* Deleting tags
 

## Evernote integration

* Deleting notes
* Deleting tags
* Deleting notebooks
* Support syncing an entire Evernote account with getFilteredSyncChunk, LevelDB and Elasticsearch. (But get WYSIWYG working first)
* Support fetching resources, images, PDFs, etc
* Eventually: Support sync chunks

## Database

* LevelDB
* Setup LevelDB session store

## Tooling

* Setup good app-level logging system
* CLI for poking at the Evernote API by hand.

## Organizational tasks

* Merge config.js into config/settings.js
* Remove sass, handlebars, bootstrap, etc
* Give all of the promises labels.

## Automation tasks

* Get Gruntfile.coffee working
* Bring back jshint, fix few remaining warnings, customize it so it's less annoying, have it cover the specs

## Testing tasks

* Create an afterAll in evernote_api_spec that checks cached responses for .length > 40 and then trims them down to 10 using ConcurrenyFunnel
* Get the --debug debugger working with jasmine-node, grunt watch, etc

## Node.js

* Remove /api/api rewrite hack

## Devops

* Setup Docker
* Deploy to Digital Ocean

