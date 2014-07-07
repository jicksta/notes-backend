var fs = require('fs'),
    _ = require('underscore'),
    EvernoteSession = require('../../lib/evernote_session'),
    sandboxSession = require('../fixtures/sandbox_session');

describe("Generation of fixtures from the web service", function() {

  fixture("notes_result.json", function(api) {
    var notes = api.notes();
    notes.then(function(result) {
      expect(result.notes.length).toBeGreaterThan(2);
    });
    return notes;
  });

  function fixture(filename, promiseFactory) {
    var fixturesDir = fs.realpathSync("spec/fixtures"),
        filepath = fixturesDir + '/' + filename;

    expect(fs.existsSync(fixturesDir)).toEqual(true);

    if (!fs.existsSync(filepath)) {
      it("fetches from the server", function(done) {
        var api = new EvernoteSession(sandboxSession).api,
            promise = promiseFactory(api),
            errorSpy = jasmine.createSpy("promise error!");

        promise.then(function(result) {
          if (_.isObject(result)) {
            var json = JSON.stringify(result, null, 4);
            fs.writeFileSync(filepath, json);
            expect(fs.existsSync(filepath)).toEqual(true);
          } else {
            expect(_.isObject(result)).toEqual(true, "non-object resolved from promise");
          }
        }).catch(errorSpy).finally(function() {
          expect(errorSpy).not.toHaveBeenCalled();
          done();
        });
      });
    }
  }

});
