var _ = require("underscore"),
    Evernote = require("evernote").Evernote,
    fixtures = require("../support/fixtures"),
    transformer = require("../../transformers/notebook_transformer");

describe('NoteTransformer', function() {

  describe('formatNotebook', function() {
    it("walks the happy path", function() {
      var formatted = transformer.formatNotebook(fixtures.load("notebook")),
          expectedKeys = ["id", "name", "defaultNotebook", "created", "updated", "published", "stack"];

      expect(_.keys(formatted).sort()).toEqual(expectedKeys.sort());

      expect(formatted.id).toBeString();
      expect(formatted.name).toBeString();
      expect(formatted).toHaveKey("stack");
      expect(formatted.created).toBeNumber();
      expect(formatted.updated).toBeNumber();
      expect(formatted.defaultNotebook).toBeBoolean();
      expect(formatted.published).toBeBoolean();
    });

  });

  describe('toThrift', function() {

    it("returns a new Evernote.Notebook", function() {
      expect(transformer.toThrift({})).toBeInstanceOf(Evernote.Notebook);
    });

    it("sets id from guid", function() {
      expect(transformer.toThrift({id: "test"}).guid).toEqual("test");
    });


    it("passes guid, name, and stack through", function() {
      var given = { guid: str(), name: str(), stack: str() };
      var thrifty = transformer.toThrift(given);
      _.keys(given).forEach(function(key) {
        expect(thrifty[key]).toEqual(given[key]);
      });
    });

    it("blocks defaultNotebook, created, updated, and published", function() {
      var blockedAttrs = {
        defaultNotebook: true,
        created: 1,
        updated: 1,
        published: true
      };
      var thrifty = transformer.toThrift(blockedAttrs);
      _.keys(blockedAttrs).forEach(function(key) {
        expect(thrifty[key]).toBeFalsy();
      });
    });

    it("does not set any of the virtual attributes on the Thrift object", function() {
      var virtualAttrs = { created: 1, updated: 1 }
      var thrifty = transformer.toThrift(virtualAttrs);
      _.keys(virtualAttrs).forEach(function(key) {
        expect(thrifty[key]).toBeUndefined();
      });
    });

  });

  function str() {
    return _.uniqueId("test");
  }
});
