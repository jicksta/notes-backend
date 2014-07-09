var _ = require("underscore"),
    Evernote = require("evernote").Evernote,
    fixtures = require("../support/fixtures"),
    transformer = require("../../transformers/tag_transformer");

describe('TagTransformer', function() {

  describe('formatTag', function() {
    it("walks the happy path", function() {
      var formatted = transformer.formatTag(fixtures.load("tags")[0]),
          expectedKeys = ["id", "name", "parent_id"];

      expect(_.keys(formatted).sort()).toEqual(expectedKeys.sort());

      expect(formatted.id).toBeString();
      expect(formatted.name).toBeString();
      expect(formatted.parent_id).toBeNull();
    });

  });

  describe('toThrift', function() {

    it("returns a new Evernote.Tag", function() {
      expect(transformer.toThrift({})).toBeInstanceOf(Evernote.Tag);
    });

    it("sets id from guid", function() {
      expect(transformer.toThrift({id: "test"}).guid).toEqual("test");
    });


    it("sets parentGuid from parent_id", function() {
      expect(transformer.toThrift({parent_id: "test"}).parentGuid).toEqual("test");
    });

    it("passes guid and name through", function() {
      var given = { guid: str(), name: str()};
      var thrifty = transformer.toThrift(given);
      _.keys(given).forEach(function(key) {
        expect(thrifty[key]).toEqual(given[key]);
      });
    });

    it("does not set any of the virtual attributes on the Thrift object", function() {
      var virtualAttrs = { parent_id: "foobar" }
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
