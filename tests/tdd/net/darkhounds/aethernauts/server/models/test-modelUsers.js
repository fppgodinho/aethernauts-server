process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ModelUsers          = require(process.src + 'net/darkhounds/aethernauts/server/models/modelUSers.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ControllerDB :: net/darkhounds/aethernauts/server/controllers/controllerDB.js", function() {
    
    this.timeout(5500);
    
    serverCfg.dbName    = "aethernauts-test";
    var rawData         = {
        username:   "username",
        password:   "password",
        firstName:  "firstname",
        lastName:   "lastname",
        email:      "email",
        roles:      ["role1", "role2"]
    };
    var parsedData;
    //
    before(function(done) {
        ControllerDB.once(ControllerDB.CONNECTED, function(){ done(); });
        ControllerDB.connect(serverCfg);
    });
    
    it("Should created a new user with the rawdata", function(done) {
        ModelUsers.create(rawData, function (err, data) {
            parsedData = data;
            done();
        });
    });
    
    it("Should have the email set to '" + rawData.email + "'", function() {
        expect(parsedData.email).to.equal(rawData.email);
    });
    
    after(function(done) {
        ControllerDB.disconnect();
        ControllerDB.once(ControllerDB.DISCONNECTED, function(){ done(); });
    });
});