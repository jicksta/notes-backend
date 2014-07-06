var config = {
  development: {
    server: {
      port: 4000,
    },
    database: { }
  },
  testing: {
    server: {
      port: 3001
    },
    database: { }
  },
  production: {
    server: {
      port: 8080
    },
    database: { }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
