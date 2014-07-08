var RSVP = require('rsvp');

describe('Custom matchers', function() {

  describe('toBeInstanceOf', function() {
    it('works with objects', function() {
      var obj = new Buffer(0);
      expect(obj).toBeInstanceOf(Buffer);
    });
  });

  describe('underscore-like matchers', function() {

    describe('toBeEmpty', function() {
      it('recognizes empty things', function() {
        expect([]).toBeEmpty();
        expect({}).toBeEmpty();
        expect("").toBeEmpty();
        expect(null).toBeEmpty();
        expect(undefined).toBeEmpty();
      });

      it('recognizes non-empty things', function() {
        var good = [{foo: 1}, [0], [false], [undefined], [null, null]];
        good.forEach(function(item) {
          expect(item).not.toBeEmpty();
        })
      });
    });

    describe('toBeArray', function() {
      it('recognizes arrays', function() {
        expect([]).toBeArray();
        expect([1]).toBeArray();
      });
      it('recognizes non-arrays', function() {
        [{}, 1, null, undefined, new Date()].forEach(function(bad) {
          expect(bad).not.toBeArray();
        });
      });
    });

    describe('toBeString', function() {
      it('recognizes strings', function() {
        expect("").toBeString();
        expect("jay").toBeString();
      });
      it('recognizes non-strings', function() {
        [{}, 1, null, undefined, new Date()].forEach(function(bad) {
          expect(bad).not.toBeString();
        });
      });
    });

    describe('toBeNumber', function() {
      it('recognizes numbers', function() {
        expect(0).toBeNumber();
        expect(12.34).toBeNumber();
      });
      it('recognizes non-strings', function() {
        [{}, null, undefined, new Date(), []].forEach(function(bad) {
          expect(bad).not.toBeNumber();
        });
      });
    });

    describe('toBeObject', function() {
      it('recognizes objects', function() {
        expect({}).toBeObject();
        expect(new Date()).toBeObject();
      });
      it('recognizes non-objects', function() {
        [[], 1, null, undefined].forEach(function(bad) {
          expect(bad).not.toBeObject();
        });
      });
    });

  });

  describe('toBePromise', function() {

    it('recognizes promises', function() {
      expect(new RSVP.Promise(function() {
      })).toBePromise();
    });

    it('recognizes non-promises', function() {
      var bad = [ [], 1, new Object(), {}, new Date() ];
      bad.forEach(function(nonPromise) {
        expect(nonPromise).not.toBePromise();
      });
    });
  });

  describe('toFinish async matchers', function() {

    describe('toFinish', function() {
      it('executes the done callback if the promise is resolved', function(done) {
        var promise = new RSVP.Promise(function(resolve) {
          resolve();
        });
        promise.finally(function() {
          expect(promise).toFinish(done());
        })
      });

      it('does not report an error when expected not to finish', function(done) {
        var promise = new RSVP.Promise(function(resolve, reject) {
          reject("FAIL!");
        });
        expect(promise).not.toFinish(done);
      });

    });

    describe('toFinishWith', function() {

      it('invokes the callback if the promise resolves', function(done) {
        var spy = jasmine.createSpy('for promise'),
            expectedResult = {foo: 123};

        var promise = new RSVP.Promise(function(resolve) {
          resolve(expectedResult);
        });

        expect(promise).toFinishWith(noop, spy);
        promise.finally(function() {
          expect(spy).toHaveBeenCalledWith(expectedResult);
          done()
        });
      });

      it('does not allow expect().not negation', function() {
        expect(function() {
          var promise = new RSVP.Promise(noop);
          expect(promise).not.toFinishWith(noop, noop);
        }).toThrow();
      });

      it('invokes its callback with multiple parameters when resolving a RSVP.all composite promise', function(done) {
        var one = RSVP.Promise.cast("one"),
            two = RSVP.Promise.cast("two");
        expect(RSVP.all([one, two])).toFinishWith(done, function(values) {
          expect(values).toEqual(["one", "two"]);
        });
      });

    });

  });

  function noop() {}

});

