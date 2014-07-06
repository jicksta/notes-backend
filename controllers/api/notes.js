var _ = require('underscore');

exports.notebooks = function(ensession) {
  return ensession.api.notebooks().then(function(notebooks) {
    return { notebook: notebooks.map(idFromGUID) };
  });
};

exports.createNotebook = function(ensession, request, response) {
  throw("TODO");
};

exports.notes = function(ensession) {
  return ensession.api.notes({max: 40}).then(function(result) {
    return { note: result.notes.map(idFromGUID) };
  });
};

exports.note = function(ensession, request) {
  var noteID = request.params.id;
  return ensession.api.note(noteID).then(function(note) {
    return { note: note };
  });
};

exports.tags = function(ensession) {
  return ensession.api.tags().then(function(tags) {
    return { tag: tags.map(idFromGUID) };
  });
};


function idFromGUID(obj) {
  return _.extend({id: obj.guid}, obj);
}
