var _ = require('underscore'),
    Evernote = require('evernote').Evernote,
    xforms = require('./transformations');

exports.formatTag = formatTag;
exports.toThrift = toThrift;

function formatTag(operand) {
  return xforms.apply(operand, ["guidToID", setParent, whitelist]);
}

function toThrift(formattedJSON) {
  return new Evernote.Tag({
    guid: formattedJSON.guid || formattedJSON.id,
    name: formattedJSON.name,
    parentGuid: formattedJSON.parentGuid || formattedJSON.parent_id
  });
}

function whitelist(obj) {
  return _.pick(obj, "id", "name", "parent_id");
}

function setParent(obj) {
  return _.extend(obj, {parent_id: obj.parentGuid});
}

/*
  "guid": "40c7dc7c-9866-43bc-a8ec-1fc99fa201e2",
  "name": "tag0.26425244892016053",
  "parentGuid": null,
  "updateSequenceNum": 20
*/
