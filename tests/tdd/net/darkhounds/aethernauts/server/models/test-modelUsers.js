process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ModelUsers          = require(process.src + 'net/darkhounds/aethernauts/server/models/modelUsers.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');

describe("ModelUsers :: net/darkhounds/aethernauts/server/controllers/modelUsers.js", function() {
    
    this.timeout(5000);
    
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
            expect(err).to.be.null;
            parsedData = data;
            done();
        });
    });
    
    it("Should have the same parsed data as the raw data", function() {
        expect(parsedData.username).to.equal(rawData.username);
        expect(parsedData.password).to.equal(rawData.password);
        expect(parsedData.firstname).to.equal(rawData.firstname);
        expect(parsedData.lastname).to.equal(rawData.lastname);
        expect(parsedData.email).to.equal(rawData.email);
        expect(parsedData.roles).to.include.members(rawData.roles);
    });

    
    after(function(done) {
        ControllerDB.disconnect();
        ControllerDB.once(ControllerDB.DISCONNECTED, function(){ done(); });
    });
});