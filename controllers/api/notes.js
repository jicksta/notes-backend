var _ = require('underscore'),
    settings = require('../../config/settings'),
    NoteTransformer = require('../../transformers/note_transformer'),
    NotebookTransformer = require('../../transformers/notebook_transformer'),
    TagTransformer = require('../../transformers/tag_transformer');

exports.note = function(ensession, request) {
  var noteID = request.params.id;
  return ensession.api.note(noteID).then(NoteTransformer.formatNote).then(wrapWith("note"));
};

exports.notes = function(ensession, request) {
  return ensession.api.notes(paginate(request.params)).then(NoteTransformer.formatNotesResponse).then(wrapWith("note"));
};

exports.createNote = function(ensession, request) {
  return ensession.api.createNote(request.params.note).then(NoteTransformer.formatNote).then(wrapWith("note"));
};

exports.updateNote = function(ensession, request) {
  return ensession.api.updateNote(request.params.note).then(NoteTransformer.formatNote).then(wrapWith("note"));
};

exports.deleteNote = function(ensession, request) {
  var noteID = request.params.id;
  return ensession.api.deleteNote(noteID).then(deleteResponse);
};

exports.notebook = function(ensession, request) {
  var notebookID = request.params.id;
  return ensession.api.notebook(notebookID).then(NotebookTransformer.formatNotebook).then(wrapWith("notebook"));
};

exports.notebooks = function(ensession) {
  return ensession.api.notebooks().then(NotebookTransformer.formatNotebook).then(wrapWith("notebook"));
};

exports.createNotebook = function(ensession, request) {
  return ensession.api.createNotebook(request.params.notebook).then(NotebookTransformer.formatNotebook).then(wrapWith("notebook"));
};

exports.updateNotebook = function(ensession, request) {
  return ensession.api.updateNotebook(request.params.notebook).then(NotebookTransformer.formatNotebook).then(wrapWith("notebook"));
};

exports.tag = function(ensession, request) {
  var tagID = request.params.id;
  return ensession.api.tag(tagID).then(TagTransformer.formatTag).then(wrapWith("tag"));
};

exports.tags = function(ensession) {
  return ensession.api.tags().then(TagTransformer.formatTag).then(wrapWith("tag"));
};

exports.createTag = function(ensession, request) {
  return ensession.api.createTag(request.params.tag).then(TagTransformer.formatTag).then(wrapWith("tag"));
};

exports.deleteTag = function(ensession, request) {
  var tagID = request.params.id;
  return ensession.api.untagAll(tagID).then(deleteResponse);
};

exports.updateTag = function(ensession, request) {
  return ensession.api.updateTag(request.params.tag).then(TagTransformer.formatTag).then(wrapWith("tag"));
};

exports.deleteNotebook = function(ensession, request) {
  var notebookID = request.params.id;
  return ensession.api.deleteNotebook(notebookID).then(deleteResponse);
};


///////////////////////////////////////////
///////////////////////////////////////////

function wrapWith(wrapping) {
  return function(value) {
    var obj = {};
    obj[wrapping] = value;
    return obj;
  }
}

function paginate(params) {
  var perPage = params.per_page || settings.paginationPageSizeDefault;
  if (perPage > settings.paginationPageSizeMax) throw "Pagination param too large!";
  return {max: perPage};
}

function deleteResponse(updateSequenceNumber) {
  return {};
}
