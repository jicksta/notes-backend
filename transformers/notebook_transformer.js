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
