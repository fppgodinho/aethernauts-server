process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ModelContinents     = require(process.src + 'net/darkhounds/aethernauts/server/models/modelContinents.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ModelContinents :: net/darkhounds/aethernauts/server/controllers/modelContinents.js", function() {
    
    this.timeout(5000);
    
    serverCfg.dbName    = "aethernauts-test";
    var rawData         = {
        name:    "Atlantis"
    };
    var parsedData;
    //
    before(function(done) {
        ControllerDB.once(ControllerDB.CONNECTED, function(){ done(); });
        ControllerDB.connect(serverCfg);
    });
    
    it("Should created a new connection with the rawdata", function(done) {
        ModelContinents.create(rawData, function (err, data) {
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