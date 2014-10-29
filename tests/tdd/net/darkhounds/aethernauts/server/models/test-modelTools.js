process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ModelTools          = require(process.src + 'net/darkhounds/aethernauts/server/models/modelTools.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ModelTools :: net/darkhounds/aethernauts/server/controllers/modelTools.js", function() {
    
    this.timeout(5000);
    
    serverCfg.dbName    = "aethernauts-test";
    var rawData         = {
        name:       "Tool of God",
        size:       "1",
        weight:     "10"
    };
    var parsedData;
    //
    before(function(done) {
        ControllerDB.once(ControllerDB.CONNECTED, function(){ done(); });
        ControllerDB.connect(serverCfg);
    });
    
    it("Should created a new item with the rawdata", function(done) {
        ModelTools.create(rawData, function (err, data) {
            expect(err).to.be.null;
            parsedData = data;
            done();
        });
    });
    
    it("Should have 'Item' flag ", function() {
        expect(parsedData.flags).to.contain("Item");
        expect(parsedData.flags).to.contain("Tool");
    });
    
    after(function(done) {
        ControllerDB.disconnect();
        ControllerDB.once(ControllerDB.DISCONNECTED, function(){ done(); });
    });
});