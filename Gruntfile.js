'use strict';

module.exports = function(grunt)                                                {
    grunt.loadNpmTasks('grunt-execute');
    
    grunt.initConfig({
        execute: {
            start: {
                src: ['./src/net/darkhounds/aethernauts/server/main.js']
            }
        },
    });
    
    grunt.registerTask('default', ['execute:start']);
}