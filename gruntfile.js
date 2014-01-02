module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-nodemon');
	//grunt.loadNpmTasks('grunt-contrib-concat');
	// grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-contrib-cssmin');


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		nodemon: {
			dev: {
				options: {
					file: 'server.js',
					nodeArgs: ['--harmony'],
					watchedExtensions: ['js', 'jade', 'json'],
					env: {
						PORT: '3000',
						NODE_ENV: 'development'
					}
				}
			}
		},

		// cssmin: {
		// 	css: {
		// 		files: {
		// 			'public/prod/styles.min.css': [
		// 				'public/css/menomonia.css',
		// 				'public/css/menomonia-italic.css',
		// 				'public/css/bootstrap.min.css',
		// 				'public/plugins/jquery.pnotify.default.css',
		// 				'bower_components/font-awesome/css/font-awesome.min.css',
		// 				'public/css/custom.css',
		// 			]
		// 		}
		// 	},
		// },

		// uglify: {
		// 	options: {
		// 		stripBanners: false,
		// 		banner: '/*! grunt-uglify <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
		// 		mangle: true,
		// 		preserveComments: 'some',
		// 	},
		// 	libs: {
		// 		files: {
		// 			'public/prod/libs.min.js': [
		// 				'bower_components/jquery/jquery.min.js',
		// 				'bower_components/bootstrap-css/js/bootstrap.min.js',
		// 				'bower_components/lodash/dist/lodash.min.js',
		// 				'bower_components/raphael/raphael-min.js',
		// 			]
		// 		}
		// 	},
		// 	plugins: {
		// 		files:{
		// 			'public/prod/plugins.min.js': [
		// 				'public/plugins/jquery.color.min.js',
		// 				'public/plugins/underscore.string.min.js',
		// 				'public/plugins/xregexp-all-min.js',
		// 				'public/plugins/jquery.pnotify.min.js',
		// 				'public/plugins/gw2emblem-defs.js',
		// 				'public/plugins/gw2emblem.js',
		// 			]
		// 		}
		// 	},
		// 	app: {
		// 		files: {
		// 			'public/prod/app.min.js': [
		// 				'public/js/lib.js',

		// 				'public/js/anet.js',
		// 				'public/js/app*.js',
		// 			]
		// 		}
		// 	},
		// }
	});

	grunt.registerTask('default', [
		// 'cssmin',
		// 'uglify',
	]);
	//grunt.registerTask('default', ['nodemon']);

};