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
          'public/vendor/jquery.js'
          'public/vendor/underscore.js'
          'public/vendor/backbone.js'
          'public/vendor/handlebars.js'
          'public/vendor/bootstrap.js',
          'public/vendor/backbone.collectionsubset.js'
        ]
        dest: 'public/dist/vendor.js'

    uglify:
      options:
        banner: '<%= banner %>'
        mangle: false
      vendor:
        files:
          'public/dist/vendor.min.js': ['public/vendor/*.js']

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
        src: 'Gruntfile.js'
      files: [
        'public/js/*.js'
        'public/js/models/**/*.js'
        'public/js/collections/**/*.js'
        'public/js/views/**/*.js'
        'public/js/views/**/**/*.js'
      ]
    
    qunit:
      files: ['test/**/*.html']

    watch:
      gruntfile:
        files: '<%= jshint.gruntfile.src %>'
        tasks: ['jshint:gruntfile']
      files: ['public/coffee/**/*', 'public/coffee/**/*.hbs']
      tasks: ['browserify', 'concat']
    
    browserify:
      'public/dist/app.js':
        entries: ['public/coffee/entry.coffee']
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