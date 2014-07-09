module.exports = function() {
  return jasmine.createSpy("PromiseErrorSpy").andCallFake(function(err) {
    if(err.stack) {
      console.error(err.stack);
    } else {
      console.error("PromiseErrorSpy error:", err);
    }
    return err;
  });
};
