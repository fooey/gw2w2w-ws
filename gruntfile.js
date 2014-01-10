module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concurrent: {
			target: {
				tasks: ['nodemon', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		nodemon: {
			dev: {
				options: {
					file: 'server.js',
					nodeArgs: ['--harmony'],
					watchedExtensions: ['js', 'jade', 'json'],
					delayTime: 1,
					env: {
						PORT: '3000',
						NODE_ENV: 'development'
					}
				}
			}
		},

		watch: {
			css: {
				//files: 'public/stylesheets/*.css',
				files: 'public/stylesheets/style.css',
				tasks: ['cssmin'],
				options: {
					livereload: true, 
					interval: 500,
					debounceDelay: 500,
				},
			},
			js: {
				files: [
					'public/javascripts/script.js',
					'public/javascripts/lib.js'
				],
				tasks: ['uglify'],
				options: {
					livereload: true,
					interval: 500,
					debounceDelay: 500,
				},
			},
		},

		cssmin: {
			css: {
				files: {
					'public/stylesheets/style.min.css': [
						'public/stylesheets/style.css',
					]
				}
			},
		},

		uglify: {
			options: {
				stripBanners: false,
				banner: '/*! grunt-uglify <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
				mangle: false,
				preserveComments: 'some',
			},
			js: {
				files: {
					'public/javascripts/script.min.js': [
						'public/javascripts/lib.js',
						'public/javascripts/script.js',
					]
				}
			},
		}
	});



	grunt.registerTask('minify', ['cssmin', 'uglify']);
	grunt.registerTask('dev', ['minify', 'concurrent:target']);
};