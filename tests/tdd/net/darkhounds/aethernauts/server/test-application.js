process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var Application         = require(process.src + 'net/darkhounds/aethernauts/server/application.js');
var WebSocket           = require('ws');

describe("Application :: net/darkhounds/aethernauts/server/application.js", function() {
    this.timeout(100);
    var requests;
    serverCfg.dbName    = "aethernauts-test";
    //
    describe("Connections", function() {
        var client;
        var clientIP    = "127.0.0.1";
        var callbackID  = "42";
        
        before(function() {
            application = new Application();
            application.create(serverCfg);
        });
        
        it("Should connected to the DB", function(done) {
            application.on(Application.DB_CONNECTED, function(){
                done();
            });
        });

        it("Should connected to the Socket Server", function(done) {
            application.on(Application.SERVER_CONNECTED, function(){
                done();
            });
        });
        
        it("Should receive a Client connection with the ip: '" + clientIP + "'", function(done) {
            client = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);

            application.on(Application.CLIENT_CONNECTED, function(data){
                expect(data.client.ip).to.equal(clientIP);
                done();
            });
        });
        
        it("Should catch disconnection from a client with the ip: '" + clientIP + "'", function(done) {
            client.close();
            application.on(Application.CLIENT_DISCONNECTED, function(data){
                expect(data.client.ip).to.equal(clientIP);
                done();
            });
        });
        
        after(function(){
            application.destroy();
        })
    });
    
    describe("Messages", function() {
        var client;
        var clientIP    = "127.0.0.1";
        var callbackID  = "42";

        beforeEach(function(done) {
            application = new Application(serverCfg);
            application.on(Application.SERVER_CONNECTED, function(data){
                client      = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            });
            application.on(Application.CLIENT_CONNECTED, function(data){
                done();
            });
            application.create(serverCfg);
        });
        
        it("Should respond with the error: '" + errorsCfg.UnknownRequestType.code + "' to unrecognized commands", function(done) {
            client.on('message', function(data) {
                data = JSON.parse(data);
                expect(data.error.code).to.equal(errorsCfg.UnknownRequestType.code);
                done();
            });
            client.send('{"foo":"bar"}');
        });
        
        it("Should respond with the error: '" + errorsCfg.UnknownRequestType.code + "' to a bad login", function(done) {
            client.on('message', function(data) {
                // {"type":"response","status":"error","error":{"name":"MongoError"}}
                console.log(data);
                data = JSON.parse(data);
                expect(data.error.name).to.equal("MongoError");
                done();
            });
            client.send('{"type":"auth", "action":"login", "username":"teste", "password":"teste"}');
        });
        
        afterEach(function(){
            application.destroy();
        });
        
    });
});