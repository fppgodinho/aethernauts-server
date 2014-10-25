var root    = process.cwd();
var expect  = require('chai').expect;
var sinon   = require('sinon');
var mockery = require('mockery');
var doubled = require(root + "/src/net/darkhounds/core/server/doubled.js");



describe("Server", function() {
    describe("doubled", function() {
        before(function(){
            
        });
        
        it("should have a default name", function() {
            expect(doubled.calculate(2)).to.equal(4);
        });

        after(function(){

        });
    });
});
