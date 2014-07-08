## Frontend integration

* Fix authentication
* Creating notes
* Updating notes
* Deleting notes
* Finding notes with pagination and per_page params
* Creating notebooks
* Creating tags
* Deleting tags
* Handling of evernote-induced errors
* Handling of client-supplied errors (validations)

## Evernote integration

* Querying notes
* Deleting notes
* Dont use slow notes query everywhere
* Deleting notebooks // (do I have permission to do this?)
* Search serializer
* Change the "default" notebook
* Find or create tag by name
* Create a separate serialization / model layer between the controllers and the api. Move session stuff into it. Should work with promises.
* Support syncing an entire Evernote account with getFilteredSyncChunk, LevelDB and Elasticsearch. (But get WYSIWYG working first)
* Support fetching resources, images, PDFs, etc
* Eventually: Support sync chunks
* Coerce error codes to RESTful status codes
* Loading/progress states?

## Automation tasks

* Get Gruntfile.coffee working
* Bring back jshint, fix few remaining warnings, "new" instantiation issue, customize it so it's less annoying, have it cover the specs

## Testing tasks

* Port away from jasmine to chai / mocha / whatever
* Switch to karma-jasmine: https://github.com/karma-runner/karma-jasmine with Jasmine 2.0 (or not?)
* Controller specs
* Automatically handle EDAMSystemException { errorCode : 19, message : null, rateLimitDuration : 14 } by waiting duration seconds and retrying
* Create an afterAll in evernote_api_spec that checks cached responses for .length > 40 and then trims them down to 10 using ConcurrenyFunnel
* Get the --debug debugger working with jasmine-node, grunt watch, etc
* Rename toFinishWith to be .continues, .resolves, etc
* Setup two testing sessions, one for tag creating and one for everything else. Prevents pollution of main test account.
* Rename toFinish() to be toResolve? e.g. notes_controller_spec asserting the action not.toFinish() is lame.
* Clean up the spec names to be more nicely nested

## Organizational tasks

* Merge config.js into config/settings.js
* Move references of EvernoteAction into the controllers that actually expose those actions
* Remove sass, handlebars, bootstrap, etc
* Give all of the promises labels.
* Move controllers out of the api directory and remove the index controller
* Create a "meta" dir and a "support" for test helpers and their specs

## Node.js

* Remove /api/api rewrite hack
* Refresh my memory on prototypal and parasitic inheritance strategies
* Move to lodash

## Database

* Riak 2.0, LevelDB, Couchbase?
* Setup session store with database

## Tooling

* Setup good app-level logging system
* CLI for poking at the Evernote API by hand.

## Devops

* Setup Docker
* Deploy to Digital Ocean

