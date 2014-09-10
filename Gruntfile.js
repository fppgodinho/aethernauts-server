'use strict';

module.exports = function(grunt)                                                {
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    
    grunt.initConfig({
        execute: {
            start: {
                src: ['./src/main.js']
            }
        },
        
        clean: {
            build:  ["./build/**/*"],
            dist:   ["./dist/releases/**/*"],
        },
        
        copy: {
            build: {
                files: [
                    {src: './packageDist.json', dest: './build/package.json'},
                    {src: './main.js', dest: './build/main.js'},
                    {cwd: './public/', src: '**', dest: './build/public', expand: true},
                    {cwd: './src/', src: '**', dest: './build/src', expand: true},
                    {cwd: './node_modules/', src: ['**', '!grunt*/**'], dest: './build/node_modules', expand: true}
                ]
            }
        },
        
        nodewebkit: {
            dist: {
                options: {
                    build_dir:      './dist',
                    keep_nw:        true,
                    force_download: false,
                    win:            true,
                    mac:            true,
                    linux32:        true,
                    linux64:        true
                },
                src: ['./build/**/*']
            }
        }
    });
    
    grunt.registerTask('default', ['execute:start']);
    grunt.registerTask('build', ['clean:build', 'copy:build', 'clean:dist', 'nodewebkit:dist']);
}
