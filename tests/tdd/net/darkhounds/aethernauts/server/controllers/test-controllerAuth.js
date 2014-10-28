process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ControllerAuth      = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAuth.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ControllerAuth :: net/darkhounds/aethernauts/server/controllers/controllerAuth.js", function() {

    this.timeout(500);
    //
    serverCfg.dbName    = "aethernauts-test";
    var password        = "test";
    //
    before(function(done) {
        ControllerDB.connect(serverCfg);
        ControllerDB.once(ControllerDB.CONNECTED, function(){ done(); });
    });
    //
    it("Should turn a password into a 32 chars long hash", function(){
        expect(ControllerAuth.hashPassword(password)).to.have.length(32);
    });
    it("Should fail the login with invalid credentials with the '" + errorsCfg.AuthError.code + " error'", function(done){
        ControllerAuth.login("token", "teste", "teste", "127.0.0.1", function(err, data){
            expect(err.code).to.equal(errorsCfg.AuthError.code);
            done();
        });
    });
    //
    after(function(done) {
        ControllerDB.disconnect();
        ControllerDB.once(ControllerDB.DISCONNECTED, function(){ done(); });
    });
});