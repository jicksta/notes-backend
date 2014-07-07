var EvernoteSession = require('../../lib/evernote_session'),
    EvernoteAPI = require('../../lib/evernote_api'),
    sandboxSession = require('../fixtures/sandbox_session');

describe("EvernoteSession", function() {

  describe("isAuthenticated", function() {

    it("returns false when given a session without evernote data", function() {
      expect(new EvernoteSession({}).isAuthenticated).toEqual(false);
    });

    it("returns true when given a session with valid evernote data", function() {
      expect(new EvernoteSession(sandboxSession).isAuthenticated).toEqual(true);
    });

  });

  describe(".api", function() {
    it("is an EvernoteAPI object when the session is valid", function() {
      expect(new EvernoteSession(sandboxSession).api).toBeInstanceOf(EvernoteAPI);
    });

    it("is undefined when the session is invalid", function() {
      expect(new EvernoteSession({}).api).toBeUndefined()
    });
  });

});
