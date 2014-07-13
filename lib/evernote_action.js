var EvernoteSession = require('./evernote_session'),
    settings = require('../config/settings');

///
// EvernoteActions return an RSVP promise which resolve to a JSON response.
//
module.exports = function EvernoteAction(actionFn) {
  return function(request, response) {
    try {
      var ensession;
      if(settings.stubSessionWithTestAccount) ensession = new EvernoteSession(require('../spec/fixtures/sandbox_session'));
      else ensession = new EvernoteSession(request.session);

      if (!ensession) {
        return response.json(401, {error: "Not authenticated!"});
      }

      var result = actionFn(ensession, request, response);

      result.catch(onError);
      result.then(function(responseJSON) {
        log(responseJSON);
        response.json(responseJSON);
      });

    } catch (e) {
      onError(e);
    }

    function onError(err) {
      report(err);
      return response.json(500, {error: err});
    }
  };
};

function report(err) {
  console.error('---------------------');
  console.error("EvernoteAction Error:");
  console.error(err.stack);
  console.error('---------------------');
}

function log(json) {
  if (settings.logEvernoteResponses) {
    console.log('------------------------');
    console.log("EvernoteAction Response:");
    console.log(json);
    console.log('------------------------');
  }
}
