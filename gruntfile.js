module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	// grunt.loadNpmTasks('grunt-contrib-concat');
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
				files: 'public/css/style.css',
				tasks: ['cssmin'],
				options: {
					livereload: true, 
					interval: 500,
					debounceDelay: 500,
				},
			},
			appJs: {
				files: [
					'public/js/app*.js'
				],
				tasks: ['uglify:appJs'],
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
					'public/css/style.min.css': [
						'public/css/style.css',
					]
				}
			},
		},

		uglify: {
			options: {
				report: 'min',
				stripBanners: false,
				banner: '/*! grunt-uglify <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
				mangle: true,
				preserveComments: 'some',
			},
			appJs: {
				options:{
					sourceMap: 'public/js/script.map.js',
					sourceMapRoot: '/js/script.min.js',
					sourceMappingURL: function(sourceMap){return '/js/script.map.js'},
					sourceMapPrefix: 1,
					sourceMapIncludeSources: 2,
				},
				files: {
					'public/js/script.min.js': [
						// 'public/js/script.js',
						'public/js/app.js',
						'public/js/app.util.js',
						'public/js/app.wsClient.js',
						'public/js/app.overview.js',
						'public/js/app.tracker.js',
						'public/js/app.tracker.scoreboard.js',
						'public/js/app.tracker.objectives.js',
						'public/js/app.tracker.log.js',
					]
				}
			},
		}
	});



	grunt.registerTask('minify', ['cssmin', 'uglify']);
	grunt.registerTask('dev', ['minify', 'concurrent:target']);
};