process.src     = process.cwd() + '/src/';
var expect      = require('chai').expect;
var sinon       = require('sinon');
var mockery     = require('mockery');
var Response    = require(process.src + 'net/darkhounds/core/server/response.js');

describe("Response :: net/darkhounds/core/server/response.js", function() {
    this.timeout(100);
    var response;
    
    describe("Error", function() {
        var setErrorReturn;
        var errorMessage    = "error message";
        
        before(function(){
            response        = new Response();
            setErrorReturn = response.setError(errorMessage);
        });

        it("The setError should return a reference to the Response instance", function() {
            expect(setErrorReturn).to.equal(response);
        });
        
        it("Error property should be set to '" + errorMessage + "'", function() {
            expect(response.error).to.equal(errorMessage);
        });

        it("Error event should be caught even when trigger is fired before the listener is set", function(done) {
            response.on(Response.ERROR, function(error) {
                expect(error).to.equal(errorMessage);
                done();
            });
        });
    });
    
    describe("Value", function() {
        var setValueReturn;
        var valueMessage    = "value message";

        before(function(){
            response        = new Response();
            setValueReturn  = response.setValue(valueMessage);
        });

        it("The setValue should return a reference to the Response instance", function() {
            expect(setValueReturn).to.equal(response);
        });

        it("Value property should be set to '" + valueMessage + "'", function() {
            expect(response.value).to.equal(valueMessage);
        });

        it("Value event should be caught even when trigger is fired before the listener is set", function(done) {
            response.on(Response.RESOLVED, function(value) {
                expect(value).to.equal(valueMessage);
                done();
            });
        });
    });
});