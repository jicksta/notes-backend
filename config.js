var config = {
  development: {
    server: {
      port: 4000,
    },
    database: {
      url: 'mongodb://localhost/notes-backend-express_dev'
    }
  },
  testing: {
    server: {
      port: 3001
    },
    database: {
      url: 'mongodb://localhost/notes-backend-express_test'
    }
  },
  production: {
    server: {
      port: 8080
    },
    database: {
      url: 'mongodb://localhost/notes-backend-express'
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
