## Frontend integration

* Fix authentication
* Creating notes
* Updating notes
* Deleting notes
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

* Controller specs
* Create an afterAll in evernote_api_spec that checks cached responses for .length > 40 and then trims them down to 10 using ConcurrenyFunnel
* Get the --debug debugger working with jasmine-node, grunt watch, etc
* Rename toFinishWith to be .continues, .resolves, etc
* Setup two testing sessions, one for tag creating and one for everything else. Prevents pollution of main test account.

## Organizational tasks

* Merge config.js into config/settings.js
* Remove sass, handlebars, bootstrap, etc
* Give all of the promises labels.
* Move controllers out of the api directory and remove the index controller

## Node.js

* Remove /api/api rewrite hack
* Refresh my memory on prototypal and parasitic inheritance strategies

## Database

* Riak 2.0, LevelDB, Couchbase?
* Setup session store with database

## Tooling

* Setup good app-level logging system
* CLI for poking at the Evernote API by hand.

## Devops

* Setup Docker
* Deploy to Digital Ocean

