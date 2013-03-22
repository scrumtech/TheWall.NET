#global module:false
#
module.exports = (grunt)->

  #Project configuration.
  grunt.initConfig
    #Metadata.
    pkg: grunt.file.readJSON('package.json')
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'

    #Task configuration.
    concat:
      options:
        banner: '<%= banner %>'
        stripBanners: true
      vendor:
        src: [
          './vendor/underscore.js'
          './vendor/backbone.js'
          './vendor/handlebars.js'
          './vendor/bootstrap.js',
          './vendor/backbone.collectionsubset.js'
        ]
        dest: './dist/vendor.js'

    uglify:
      options:
        banner: '<%= banner %>'
        mangle: false
      vendor:
        files:
          './dist/vendor.min.js': ['./vendor/*.js']
          './dist/app.min.js': ['./dist/app.js']

    jshint:
      options:

        globals:
          $: true
          jQuery: true
          Backbone: true
          _: true
          require: true
          console: true
          module: true
      gruntfile:
        src: 'Gruntfile.coffee'
      files: [
        './js/*.js'
        './js/models/**/*.js'
        './js/collections/**/*.js'
        './js/views/**/*.js'
        './js/views/**/**/*.js'
      ]
    
    qunit:
      files: ['test/**/*.html']

    watch:
      gruntfile:
        files: '<%= jshint.gruntfile.src %>'
        tasks: ['jshint:gruntfile']
      files: ['./coffee/**/*', './coffee/**/*.hbs']
      tasks: ['browserify', 'concat']
    
    browserify:
      './dist/app.js':
        entries: ['./coffee/entry.coffee']
        options:
          debug: true

  #These plugins provide necessary tasks.
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-nodeunit'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadTasks('tasks')

  #Default task.
  grunt.registerTask 'default', ['browserify', 'concat', 'uglify']