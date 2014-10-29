process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ModelSessions    = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ModelSessions :: net/darkhounds/aethernauts/server/controllers/modelSessions.js", function() {
    
    this.timeout(5000);
    
    serverCfg.dbName    = "aethernauts-test";
    var rawData         = {
        ip:         "127.0.0.1",
        token:      "aFakeTokeForDummyUser"
    };
    var parsedData;
    //
    before(function(done) {
        ControllerDB.once(ControllerDB.CONNECTED, function(){ done(); });
        ControllerDB.connect(serverCfg);
    });
    
    it("Should created a new session with the rawdata", function(done) {
        ModelSessions.create(rawData, function (err, data) {
            expect(err).to.be.null;
            parsedData = data;
            done();
        });
    });
    
    after(function(done) {
        ControllerDB.disconnect();
        ControllerDB.once(ControllerDB.DISCONNECTED, function(){ done(); });
    });
});