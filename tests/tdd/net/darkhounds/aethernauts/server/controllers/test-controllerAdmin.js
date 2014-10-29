process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ControllerAdmin     = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAdmin.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ControllerAdmin :: net/darkhounds/aethernauts/server/controllers/controllerAdmin.js", function() {
    this.timeout(500);
    //
    serverCfg.dbName    = "aethernauts-test";
    //
    before(function(done) {
        ControllerDB.connect(serverCfg);
        ControllerDB.once(ControllerDB.CONNECTED, function(){ done(); });
    });
    //
    it("Should fail to validate the user as an admin with the error: '" + errorsCfg.NotLogedin.code + "' ", function(done) {
        expect(ControllerAdmin.isAdmin("aToken", function(err) {
            expect(err.code).to.equal(errorsCfg.NotLogedin.code);
            done();
        }));
    });
    //
    after(function(done) {
        ControllerDB.disconnect();
        ControllerDB.once(ControllerDB.DISCONNECTED, function(){ done(); });
    });
});