var _ = require('underscore'),
    controller = require('../../controllers/api/notes'),
    EvernoteSession = require('../../lib/evernote_session'),
    sandboxSession = require('../fixtures/sandbox_session'),
    SpyPromise = require('../util/spy_promise'),
    transformer = require('../../transformers/note_transformer'),
    settings = require('../../config/settings'),
    fixtures = require('../util/fixtures');

describe("Notes controllers", function() {

  var ensession, api, onerror;
  beforeEach(function() {
    onerror = jasmine.createSpy("onerror spy");
    ensession = new EvernoteSession(sandboxSession);
    ensession.api = api = apiSpy(ensession.api);
  });

  afterEach(function() {
    expect(onerror).not.toHaveBeenCalled();
    if(onerror.wasCalled) {
      console.error(onerror.argsForCall[0][0].stack);
    }
  });

  describe('#notes', function() {

    describe('responses', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = fixtures.load('notes_result');
        formattedFixture = transformer.formatNotesResponse(rawFixture);
        api.notes.promise.resolve(rawFixture);
      });

      it("wraps and transforms the notes from the API", function(done) {
        controller.notes(ensession, request()).catch(onerror).then(function(response) {
          expect(api.notes).toHaveBeenCalled();
          expect(response.note).toEqual(formattedFixture);
        }).finally(done);
      });

    });

    describe("the :per_page param", function() {

      it('translates the :per_page into a "max" param', function() {
        var perPage = 100;
        controller.notes(ensession, requestWithParams({per_page: perPage}));
        expect(api.notes).toHaveBeenCalledWith({max: perPage});
      });


      it("uses the per_page default specified in the settings", function() {
        var perPageDefault = settings.paginationPageSizeDefault;
        expect(perPageDefault).toBeNumber();
        controller.notes(ensession, request());
        expect(api.notes).toHaveBeenCalledWith({max: perPageDefault});
      });

      xit('translates the :page param into an "offset" param', function() {
      });

      it("rejects a :per_page greater than 100", function() {
        expect(function() {
          controller.notes(ensession, requestWithParams({per_page: 101}));
        }).toThrow();
        expect(api.notes).not.toHaveBeenCalled();
      });

    });

  });

  function apiSpy(api) {
    _.functions(api).forEach(function(methodName) {
      var spyPromise = SpyPromise("EvernoteAPI spy for " + methodName);
      spyOn(api, methodName).andCallFake(function() {
        spyPromise.resolve.apply(null, arguments);
        return spyPromise;
      });
      api[methodName].promise = spyPromise;
    });
    return api;
  }

  function request() {
    return {params: {}};
  }

  function requestWithParams(params) {
    var req = request();
    _.extend(req.params, params);
    return req;
  }

});
