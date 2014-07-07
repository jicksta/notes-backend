var EvernoteSession = require('../../lib/evernote_session'),
    EvernoteAPI = require('../../lib/evernote_api'),
    sandboxSession = require('../fixtures/sandbox_session');

describe("EvernoteSession", function() {
  var ensession;

  beforeEach(function() {
    ensession = new EvernoteSession(sandboxSession);
  });

  it("exposes an API object", function() {
    expect(ensession.api).toBeDefined();
  });

});
