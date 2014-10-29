process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ModelWorlds    = require(process.src + 'net/darkhounds/aethernauts/server/models/modelWorlds.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ModelWorlds :: net/darkhounds/aethernauts/server/controllers/modelWorlds.js", function() {
    
    this.timeout(5000);
    
    serverCfg.dbName    = "aethernauts-test";
    var rawData         = {
        name:    "Nod"
    };
    var parsedData;
    //
    before(function(done) {
        ControllerDB.once(ControllerDB.CONNECTED, function(){ done(); });
        ControllerDB.connect(serverCfg);
    });
    
    it("Should created a new connection with the rawdata", function(done) {
        ModelWorlds.create(rawData, function (err, data) {
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