process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var ControllerServer    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerServer.js');
var WebSocket           = require('ws');

describe("ControllerServer :: net/darkhounds/aethernauts/server/controllers/controllerServer.js", function() {
    this.timeout(100);
    //
    var clientIP                = "127.0.0.1";
    var clientToken             = "clientToken";
    //
    describe("Connect", function() {
        var serverConnectResponse;
        //
        beforeEach(function() {
            serverConnectResponse   = ControllerServer.connect(serverCfg);
        });
        //
        it("The server connect returns an instance of it self", function() {
            expect(serverConnectResponse).to.equal(ControllerServer);
        });
        //
        it("The server should be connected", function(done) {
            ControllerServer.once(ControllerServer.CONNECTED, function() {
                expect(ControllerServer.isConnected()).be.ok;
                done();
            });
        });
        //
        it("The server should be named '" + serverCfg.name + "'", function(done) {
            ControllerServer.once(ControllerServer.CONNECTED, function() {
                expect(ControllerServer.getName()).to.equal(serverCfg.name);
                done();
            });
        });
        //
        it("The server port should be set to '" + serverCfg.port + "'", function(done) {
            ControllerServer.once(ControllerServer.CONNECTED, function() {
                expect(ControllerServer.getPort()).to.equal(serverCfg.port);
                done();
            });
        });
        //
        it("The server encryption key should be set to '" + serverCfg.salt + "'", function(done) {
            ControllerServer.once(ControllerServer.CONNECTED, function() {
                expect(ControllerServer.getSalt()).to.equal(serverCfg.salt);
                done();
            });
        });
        //
        afterEach(function(done) {
            ControllerServer.disconnect();
            ControllerServer.once(ControllerServer.DISCONNECTED, function(){
                done();
            });
        });
    });
    
    describe("Disconnect", function() {
        var serverDisconnectResponse;
        //
        
        beforeEach(function(done) {
            ControllerServer.connect(serverCfg);
            ControllerServer.once(ControllerServer.CONNECTED, function(){
                serverDisconnectResponse    = ControllerServer.disconnect();
                ControllerServer.once(ControllerServer.DISCONNECTED, function() {
                    done();
                });
            });
        });
        //
        it("The server disconnect returns an instance of it self", function() {
            expect(serverDisconnectResponse).to.equal(ControllerServer);
        });
        //
        it("The server name should be set to empty", function() {
            expect(ControllerServer.getName()).to.equal('');
        });
        //
        it("The server port should be set to empty", function() {
            expect(ControllerServer.getPort()).to.equal(0);
        });
        //
        it("The server salt should be set to empty", function() {
            expect(ControllerServer.getSalt()).to.equal('');
        });
    });
    
    describe("Clients", function() {
        var clients                 = 3;
        //
        beforeEach(function(done) {
            ControllerServer.connect(serverCfg);
            ControllerServer.once(ControllerServer.CONNECTED, function() {
                done();
            });
        });
        //
        it("The clients count should be set to '" + clients + "' after they connected", function(done) {
            var clientsAdded    = 0;
            for (var i = 0; i < clients; i ++) new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            ControllerServer.on(ControllerServer.CLIENT_CONNECTED, function() {
                if (++clientsAdded < clients) return;
                expect(ControllerServer.getClientCount()).to.equal(3);
                ControllerServer.removeListener(ControllerServer.CLIENT_CONNECTED, arguments.callee);
                done();
            });
        });
        //
        it("The client ip should be '" + clientIP + "'", function(done) {
            new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            //
            ControllerServer.once(ControllerServer.CLIENT_CONNECTED, function(data) {
                expect(data.client.ip).to.equal("127.0.0.1");
                done();
            });
        });
        //
        it("The client token should be 32 chars long", function(done) {
            new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            //
            ControllerServer.once(ControllerServer.CLIENT_CONNECTED, function(data) {
                expect(data.client.token).to.have.length(32);
                done();
            });
        });
        //
        it("The client count should be 0 after the only client disconnects", function(done) {
            var client = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            client.close();
            //
            ControllerServer.once(ControllerServer.CLIENT_DISCONNECTED, function() {
                expect(ControllerServer.getClientCount()).to.equal(0);
                done();
            });
        });
        //
        it("The clients count should be set to 0 after the server is disconnected", function() {
            ControllerServer.disconnect();
            expect(ControllerServer.getClientCount()).to.equal(0);
        });
        //
        afterEach(function(done) {
            ControllerServer.disconnect();
            ControllerServer.once(ControllerServer.DISCONNECTED, function(){
                done();
            });
        });
    });
    
    describe("Messages", function() {
        var foobarMessage       = '{"foo": "bar"}';
        var callbackID          = '42';
        //
        beforeEach(function(done) {
            ControllerServer.connect(serverCfg);
            ControllerServer.once(ControllerServer.CONNECTED, function() {
                done();
            });
        });
        //
        it("The client message property 'foo' should be set to 'bar'", function(done) {
            var client      = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            client.onopen   = function() { client.send(foobarMessage); };
            ControllerServer.once(ControllerServer.CLIENT_MESSAGE, function(data) {
                expect(data.request.foo).to.equal("bar");
                done();
            });
        });
        //
        it("The client response callbackID should be set to '" + callbackID + "'", function(done) {
            var client      = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            client.onopen   = function() { client.send('{"callbackID": "' + callbackID + '"}'); };
            ControllerServer.once(ControllerServer.CLIENT_MESSAGE, function(data) {
                expect(data.response.callbackID).to.equal(callbackID);
                done();
            });
        });
        //
        afterEach(function(done) {
            ControllerServer.disconnect();
            ControllerServer.once(ControllerServer.DISCONNECTED, function(){
                done();
            });
        });
    });
    
    describe("Misc", function() {
        beforeEach(function(done) {
            ControllerServer.connect(serverCfg);
            ControllerServer.once(ControllerServer.CONNECTED, function() {
                done();
            });
        });
        //
        it("The client should be registered by it's token", function(done) {
            var client      = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            ControllerServer.once(ControllerServer.CLIENT_CONNECTED, function(data) {
                expect(ControllerServer.checkClientByToken(data.client.token)).to.true;
                done();
            });
        });
        //
        it("The client should no longer be registered by it's token", function(done) {
            var client      = new WebSocket("ws://" + clientIP + ":" + serverCfg.port);
            client.close();
            ControllerServer.once(ControllerServer.CLIENT_CONNECTED, function(data) {
                expect(ControllerServer.checkClientByToken(data.client.token)).to.false;
                done();
            });
        });
        //
        afterEach(function(done){
            ControllerServer.disconnect();
            ControllerServer.once(ControllerServer.DISCONNECTED, function(){
                done();
            });
        });
    });
});