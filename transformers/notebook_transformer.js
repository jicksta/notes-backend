var _ = require('underscore'),
    Evernote = require('evernote').Evernote,
    xforms = require('./transformations');

exports.formatNotebook = formatNotebook;
exports.toThrift = toThrift;

function formatNotebook(operand) {
  return xforms.apply(operand, ["guidToID", translateTimestamps, publishedToBoolean, whitelist]);
}

function toThrift(formattedJSON) {
  return new Evernote.Notebook({
    guid: formattedJSON.guid || formattedJSON.id,
    name: formattedJSON.name,
    stack: formattedJSON.stack
  });
}

function whitelist(obj) {
  return _.pick(obj, "id", "name", "defaultNotebook", "created", "updated", "published", "stack");
}

function translateTimestamps(obj) {
  return _.extend(obj, {created: obj.serviceCreated, updated: obj.serviceUpdated});
}

// is null when false for some reason
function publishedToBoolean(obj) {
  return _.extend(obj, {published: !!obj.published});
}

///////////////////////////////////
// Thrift attributes:
//
// guid	Guid
// title	string
// content	string
// contentHash	string
// contentLength	i32
// created	Timestamp
// updated	Timestamp
// deleted	Timestamp
// active	bool
// updateSequenceNum	i32
// notebookGuid	string
// tagGuids	list<Guid>
// resources	list<Resource>
// attributes	NoteAttributes
// tagNames	list<string>


/*

  "guid": "334c455f-856f-4d8a-bd0d-0c151d6f2e78",
  "name": "Notebook 0.5825657933019102",
  "updateSequenceNum": 1269,
  "defaultNotebook": false,
  "serviceCreated": 1404782623000,
  "serviceUpdated": 1404782623000,
  "publishing": null,
  "published": null,
  "stack": null,
  "sharedNotebookIds": null,
  "sharedNotebooks": null,
  "businessNotebook": null,
  "contact": null,
  "restrictions": {
      "noReadNotes": null,
      "noCreateNotes": null,
      "noUpdateNotes": null,
      "noExpungeNotes": true,
      "noShareNotes": null,
      "noEmailNotes": true,
      "noSendMessageToRecipients": null,
      "noUpdateNotebook": null,
      "noExpungeNotebook": true,
      "noSetDefaultNotebook": null,
      "noSetNotebookStack": null,
      "noPublishToPublic": null,
      "noPublishToBusinessLibrary": null,
      "noCreateTags": null,
      "noUpdateTags": null,
      "noExpungeTags": true,
      "noSetParentTag": null,
      "noCreateSharedNotebooks": null,
      "updateWhichSharedNotebookRestrictions": null,
      "expungeWhichSharedNotebookRestrictions": 2
  }

*/
