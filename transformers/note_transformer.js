var _ = require('underscore'),
    Evernote = require('evernote').Evernote,
    xforms = require('./transformations');

exports.formatNote = formatNote;
exports.formatNotesResponse = formatNotesResponse;
exports.toThrift = toThrift;


function formatNote(operand) {
  return xforms.apply(operand, ["guidToID", notebookIDFromGuid, bodyFromContent, whitelist]);
}

function formatNotesResponse(operand) {
  return formatNote(unwrapNotes(operand));
}

function toThrift(formattedJSON) {
  return new Evernote.Note({
    guid: formattedJSON.guid || formattedJSON.id,
    title: formattedJSON.title,
    content: formattedJSON.content || formattedJSON.body,
    notebookGuid: formattedJSON.notebookGuid || formattedJSON.notebook_id,
    tagGuids: formattedJSON.tagGuids || formattedJSON.tag_ids,
    tagNames: formattedJSON.tagNames || formattedJSON.tags
  });
}

function whitelist(obj) {
  return _.pick(obj, 'id', 'body', 'created', 'notebook_id', 'title', 'updated');
}

function notebookIDFromGuid(obj) {
  return _.extend(obj, {notebook_id: obj.notebookGuid});
}

function bodyFromContent(obj) {
  if(!obj.content) return obj;
  return _.extend(obj, {body: obj.content});
}

function unwrapNotes(obj) {
  return obj.notes;
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
