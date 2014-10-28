process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ControllerDB :: net/darkhounds/aethernauts/server/controllers/controllerDB.js", function() {
    this.timeout(100);
    
    serverCfg.dbName    = "aethernauts-test";
    //
    
    describe("Connect", function() {
        var DBConnectResponse;
        //
        beforeEach(function() {
            DBConnectResponse   = ControllerDB.connect(serverCfg);
        });
        //
        it("The db connect returns an instance of it self", function() {
            expect(DBConnectResponse).to.equal(ControllerDB);
        });
        //
        it("The server should be connected", function(done) {
            ControllerDB.once(ControllerDB.CONNECTED, function() {
                expect(ControllerDB.isConnected()).be.ok;
                done();
            });
        });
        //
        afterEach(function(done) {
            ControllerDB.disconnect();
            ControllerDB.once(ControllerDB.DISCONNECTED, function() {
                done();
            });
        });
    });
    
    describe("Disconnect", function() {
        var DBDisconnectResponse;
        //
        beforeEach(function(done) {
            ControllerDB.connect(serverCfg);
            ControllerDB.once(ControllerDB.CONNECTED, function(){
                DBDisconnectResponse    = ControllerDB.disconnect();
                ControllerDB.once(ControllerDB.DISCONNECTED, function() {
                    done();
                });
            });
        });
        //
        it("The db disconnect returns an instance of it self", function() {
            expect(DBDisconnectResponse).to.equal(ControllerDB);
        });
        //
        //
        it("The db disconnect returns an instance of it self", function() {
            expect(DBDisconnectResponse).to.equal(ControllerDB);
        });
    });
    
});