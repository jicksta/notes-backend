var _ = require('underscore'),
    settings = require('../../config/settings'),
    NoteTransformer = require('../../transformers/note_transformer'),
    NotebookTransformer = require('../../transformers/notebook_transformer'),
    TagTransformer = require('../../transformers/tag_transformer');

exports.notes = function(ensession, request) {
  return ensession.api.notes(paginate(request.params)).then(NoteTransformer.formatNotesResponse).then(wrapWith("note"));
};

exports.notebooks = function(ensession) {
  return ensession.api.notebooks().then(NotebookTransformer.formatNotebook).then(wrapWith("notebook"));
};

exports.tags = function(ensession) {
  return ensession.api.tags().then(TagTransformer.formatTag).then(wrapWith("tag"));
};

exports.createNotebook = function(ensession, request) {
  throw("TODO");
};

exports.note = function(ensession, request) {
  var noteID = request.params.id;
  return ensession.api.note(noteID).then(function(note) {
    return { note: note };
  });
};

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

function idFromGUID(obj) {
  return _.extend({id: obj.guid}, obj);
}
