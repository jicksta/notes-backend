var RSVP = require('rsvp');

describe('Custom matchers', function() {

  describe('toBeInstanceOf', function() {
    it('works with objects', function() {
      var obj = new Buffer(0);
      expect(obj).toBeInstanceOf(Buffer);
    });
  });

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
    });

  });

  function noop() {}

});

