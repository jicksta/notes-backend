var Evernote = require('evernote').Evernote,
    EvernoteAPI = require('../../lib/evernote_api');

describe("EvernoteAPI", function() {

  var api;
  beforeEach(function() {
    api = new EvernoteAPI();
  });

  describe("#client", function() {
    it("is an instanceof Evernote.Client", function() {
      expect(api.client()).toBeInstanceOf(Evernote.Client);
    })
  });

  describe("#notestore", function() {

  });

  describe("#user", function() {
    it('fetchers user data', function(done) {
      expect(api.user()).toFinish(done, function(user) {
        expect(user.id).toEqual(123);
      });
    });

  });

  describe("#notebooks", function() {
  });

  describe("#note", function() {
  });

  describe("#noteWithContent", function() {
  });

  describe("#tags", function() {
  });

  function failer(err) {
  }

});
