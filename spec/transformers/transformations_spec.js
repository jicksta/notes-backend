var xforms = require('../../transformers/transformations'),
    _ = require('underscore');

describe("Transformations", function() {

  describe("apply", function() {

    it("applies the chain to a non-array object", function() {
      var operand = {guid: "foo"};
      var processed = xforms.apply(operand, ["guidToID"]);
      expect(processed).toEqual({guid: "foo", id: "foo"});
    });

    it("applies the chain to each object in an array", function() {
      var operand = [{guid: "one"}, {guid: "two"}];
      var processed = xforms.apply(operand, ["guidToID"]);
      expect(processed).toEqual([{guid: "one", id: "one"}, {guid: "two", id: "two"}]);
    });

    it("allows mixing of strings and functions", function() {
      var operand = {guid: "foo"};
      var processed = xforms.apply(operand, ["guidToID", ]);
      expect(processed).toEqual({guid: "foo", id: "foo"});
    });

    it("raises an exception if the second argument is not an array", function() {
      var badValues = [xforms.guidToID, null, undefined, "guidToID"];
      badValues.forEach(function(bad) {
        expect(function() {
          xforms.apply({}, bad)
        }).toThrow();
      });
    });

    it("raises an exception if given an unrecognized string xform", function() {
      expect(function() {
        xforms.apply({}, ["doesn't work"]);
      }).toThrow();
    });

  });

});
