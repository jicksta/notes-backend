var _ = require('underscore');

var xforms = module.exports = {

  apply: function(oneOrMany, chain) {
    var functions = functionize(chain);

    // var chainedFunctions = _.compose(functions.reverse()); // Dunno WTF is wrong with this.
    var chainedFunctions = function(obj) {
      return _.inject(functions, function(memo, fn) {
        return fn(memo);
      }, obj);
    };

    return _.isArray(oneOrMany) ? oneOrMany.map(chainedFunctions) : chainedFunctions(oneOrMany);
  },

  guidToID: function(obj) {
    return _.extend(obj, {id: obj.guid});
  },

  gibberish: _.identity, // TODO!

};

function functionize(functions) {
  return functions.map(function(fn) {
    if (_.isFunction(fn)) return fn;
    if (_.isString(fn) && fn in xforms) return xforms[fn];
    throw("Cannot build a transformation with a non-function or an unrecognized string! (" + (typeof fn) + ")");
  });
}
