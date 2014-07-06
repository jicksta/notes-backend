var _ = require('underscore');

exports.notebooks = function(request, response, ensession) {
  return ensession.api.notebooks().then(function(notebooks) {
    return { notebook: notebooks.map(idFromGUID) };
  });
};

exports.notes = function(request, response, ensession) {
  return ensession.api.notes({max: 40}).then(function(result) {
    return { note: result.notes.map(idFromGUID) };
  });
};

exports.tags = function(request, response, ensession) {
  return ensession.api.tags().then(function(tags) {
    return { tag: tags.map(idFromGUID)};
  });
};


function idFromGUID(obj) {
  return _.extend({id: obj.guid}, obj);
}
