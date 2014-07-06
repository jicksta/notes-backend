var _ = require('underscore'),
    EvernoteSession = require('../../lib/evernote_session');

exports.notebooks = function(request, response) {
  var session = new EvernoteSession(request.session);
  if (!session) {
    return response.json(401, {error: "Not authenticated!"});
  }

  var getNotebooks = session.api.notebooks();

  getNotebooks.then(function(notebooks) {
    response.json({
      notebook: notebooks.map(idFromGUID)
    });
  });

  getNotebooks.catch(function(err) {
    return response.json(500, {error: err});
  });
};

function idFromGUID(notebook) {
  return _.extend({id: notebook.guid}, notebook);
}
