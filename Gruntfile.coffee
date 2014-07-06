module.exports = (grunt) ->

  SERVER_GLOBS = [
    'config/**/*.js',
    'controllers/**/*.js',
    'lib/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'app.js'
  ]
  SPECS_GLOBS = ['spec/**/*.js']
  IGNORES = ['**/node_modules/**', 'public/vendor/**', '**/*.min.js']
  WATCH_GLOBS = [SERVER_GLOBS..., ("!#{f}" for f in IGNORES)...]

  config=
    jshint:
      options:
        ignores: IGNORES
        jshintrc: '.jshintrc'
      server: SERVER_GLOBS

    'node-inspector':
      options:
        'save-live-edit': true

    jasmine_node:
      options:
        forceExit: true
        match: '.'
        matchall: false
        useHelpers: true
        extensions: 'js'
        specNameMatcher: 'spec'
      all: ['spec/']

    watch:
      all:
        files: WATCH_GLOBS
      server:
        files: '<%= jshint.server %>'
        tasks: 'jshint:server'
      specs:
        files: [WATCH_GLOBS..., SPECS_GLOBS...]
        tasks: ['spec']

    concurrent:
      tasks: ['node-inspector', 'watch']
      options:
        logConcurrentOutput: true
        limit: 3

  @initConfig config

  require('matchdep').filterDev('grunt-*').forEach @loadNpmTasks
  @registerTask 'default', ['jshint', 'concurrent']
  @registerTask 'spec', ['jasmine_node']

