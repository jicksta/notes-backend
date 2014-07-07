const VALID_ENVIRONMENTS = ["development", "test", "demo", "staging", "production"];
const DEFAULT_ENV = "development";

module.exports = function() {
  if(!get()) set(DEFAULT_ENV);
  return get();
};

module.exports.set = set;

function get() {
  return process.env.APP_ENV;
}

function set(newEnv) {
  if(VALID_ENVIRONMENTS.indexOf(newEnv) === -1) throw("Invalid environment: " + newEnv);
  process.env.APP_ENV = newEnv;
  return newEnv;
}
