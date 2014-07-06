var EvernoteSession = require('./evernote_session');

///
// EvernoteActions return an RSVP promise which resolve to a JSON response.
//
module.exports = function EvernoteAction(actionFn) {
  return function(request, response) {
    var ensession = new EvernoteSession(request.session);

    if (!ensession) {
      return response.json(401, {error: "Not authenticated!"});
    }

    var result = actionFn(request, response, ensession);

    result.then(function(responseJSON) {
      response.json(responseJSON);
    });

    result.catch(function(err) {
      console.error('---------------------');
      console.error("EvernoteAction Error:");
      console.error(err.stack);
      console.error('---------------------');
      return response.json(500, {error: err});
    });
  };
};
