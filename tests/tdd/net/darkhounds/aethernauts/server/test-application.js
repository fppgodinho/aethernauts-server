process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var Application         = require(process.src + 'net/darkhounds/aethernauts/server/application.js');
var WebSocket           = require('ws');

describe("Application :: net/darkhounds/aethernauts/server/application.js", function() {
    //
    this.timeout(500);
    serverCfg.dbName    = "aethernauts-test";
    //
    describe("Connections", function() {
        var client;
        var clientIP    = "127.0.0.1";
        
        beforeEach(function() {
            Application.create(serverCfg);
        });
        
        it("Should connected to the DB", function(done) {
            Application.once(Application.DB_CONNECTED, function(){ done(); });
        });

        it("Should connected to the Socket Server", function(done) {
            Application.once(Application.SERVER_CONNECTED, function(){ done(); });
        });
        
        it("Should receive a Client connection with the ip: '" + clientIP + "'", function(done) {
            Application.once(Application.SERVER_CONNECTED, function(){
                client = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            });
            
            Application.once(Application.CLIENT_CONNECTED, function(data) {
                expect(data.client.ip).to.equal(clientIP);
                done();
            });
        });
        
        it("Should catch disconnection from a client with the ip: '" + clientIP + "'", function(done) {
            Application.once(Application.SERVER_CONNECTED, function() {
                client = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            });
            Application.once(Application.CLIENT_CONNECTED, function() {
                client.close();
            });
            Application.once(Application.CLIENT_DISCONNECTED, function(data) {
                expect(data.client.ip).to.equal(clientIP);
                done();
            });
        });
        
        afterEach(function(done) {
            Application.destroy();
            Application.once(Application.DESTROYED, function(){ done(); });
        })
    });
    
    describe("Messages", function() {
        var client;
        var clientIP    = "127.0.0.1";
        
        beforeEach(function(done) {
            Application.once(Application.CREATED, function() {
                client      = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            });
            Application.once(Application.CLIENT_CONNECTED, function(){ done(); });
            Application.create(serverCfg);
        });
        
        it("Should respond with the error: '" + errorsCfg.UnknownRequestType.code + "' to unrecognized commands", function(done) {
            client.once('message', function(data) {
                data = JSON.parse(data);
                expect(data.error.code).to.equal(errorsCfg.UnknownRequestType.code);
                done();
            });
            client.send('{"foo":"bar"}');
        });
        
        it("Should respond with the error: '" + errorsCfg.AuthError.code + "' to a bad login", function(done) {
            client.once('message', function(data) {
                data = JSON.parse(data);
                expect(data.error.code).to.equal(errorsCfg.AuthError.code);
                done();
            });
            client.send('{"type":"auth", "action":"login", "username":"teste", "password":"teste"}');
        });
        
        afterEach(function(done){
            Application.destroy();
            Application.once(Application.DESTROYED, function(){ done(); });
        });
        
    });
});