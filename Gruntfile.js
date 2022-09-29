module.exports = function(grunt) {

    // -- Config -------------------------------------------------------------------
    grunt.initConfig({

        nick : 'birdie-ui',
        pkg  : grunt.file.readJSON('package.json'),

        // -- Clean Config ----------------------------------------------------------
        clean: {
            build      : ['dist/'],
            buildAfter : ['dist/css/'],
            release    : ['release/<%= pkg.version %>/']
        },
        
        // -- Copy Config -----------------------------------------------------------
        copy: {
            build: {
                src     : 'src/**/*.css',
                dest    : 'dist/css/',
                expand  : true,
                flatten : true
            },

            release: {
                src  : '{LICENSE,README.md}',
                dest : 'dist/'
            }
        },

        // -- Concat Config ---------------------------------------------------------
        concat: {
            build: {
                files: [
                    {'dist/css/utilities.css': [                        
                        'dist/css/birdie-reset.css',  
                        'dist/css/birdie-colors.css',
                        'dist/css/birdie-typography.css',                      
                        'dist/css/base.css',
                    ]},

                    {'dist/css/components.css': [
                        'dist/css/birdie-grid.css',
                        'dist/css/birdie-buttons.css',
                        'dist/css/birdie-textfields.css',
                        'dist/css/birdie-selections.css',
                        'dist/css/birdie-dropdown.css',                        
                        'dist/css/birdie-tooltips.css',
                        'dist/css/birdie-datatable.css',
                        'dist/css/birdie-card.css'
                    ]},        

                    // Rollups

                    {'dist/<%= nick %>.css': [                        
                        'dist/css/utilities.css',                        
                        'dist/css/components.css'
                    ]}
                ]
            }
        },

        // -- PostCSS Config ---------------------------------------------------------
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')()
                ]
            },
            build: {
                src: 'dist/**/*.css'
            }
        },

        // -- CSSMin Config ---------------------------------------------------------
        cssmin: {
            options: {
                noAdvanced: true
            },

            files: {
                expand: true,
                src   : 'dist/*.css',
                ext   : '.min.css'
            }
        },

        // -- Compress Config -------------------------------------------------------
        compress: {
            release: {
                options: {
                    archive: 'release/<%= pkg.version %>/<%= nick %>-<%= pkg.version %>.tar.gz'
                },

                expand : true,
                flatten: true,
                src    : 'dist/*',
                dest   : '<%= nick %>/<%= pkg.version %>/'
            }
        },

        // -- Watch/Observe Config --------------------------------------------------
        observe: {
            src: {
                files: 'src/**/*.css',
                tasks: ['test', 'suppress', 'build'],

                options: {
                    interrupt: true
                }
            }
        }
    });

    // -- Main Tasks ---------------------------------------------------------------

    // npm tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('@lodder/grunt-postcss');

    // register npm tasks
    grunt.registerTask('default', ['build']); 
    
    grunt.registerTask('build', [
        'clean:build',
        'copy:build',
        'concat:build',
        'postcss',
        'cssmin',
        'clean:buildAfter'
    ]);

    // Makes the `watch` task run a build first.
    grunt.renameTask('watch', 'observe');
    grunt.registerTask('watch', ['default', 'observe']);

    grunt.registerTask('release', [
        'default',
        'clean:release',
        'copy:release',
        'compress:release'        
    ]);
};