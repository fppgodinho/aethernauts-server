process.src             = process.cwd() + '/src/';
var expect              = require('chai').expect;
var sinon               = require('sinon');
var mockery             = require('mockery');
var ControllerServer    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerServer.js');
var WebSocket           = require('ws');

describe("Aethernauts", function() {
    describe("Server", function() {
        describe("Controllers", function() {
            this.timeout(100);
            
            describe("ControllerServer", function() {
                var server;
                var serverName              = 'aethernauts.darkhounds.net';
                var serverPort              = '42000';
                var serverSalt              = 'A3th3rN4ut5';
                //
                var clientIP                = "127.0.0.1";
                var clientToken             = "clientToken";
                
                describe("Connect", function() {
                    var serverConnectResponse;
                    //
                    beforeEach(function(){
                        server                  = new ControllerServer();
                        serverConnectResponse   = server.connect({name: serverName, port: serverPort, salt: serverSalt});
                    });
                    //
                    it("The server connect returns an instance of it self", function() {
                        expect(serverConnectResponse).to.equal(server);
                    });
                    //
                    it("The server should be connected", function(done) {
                        server.on(ControllerServer.CONNECTED, function() {
                            expect(server.isConnected()).be.ok;
                            done();
                        });
                    });
                    //
                    it("The server should be named '" + serverName + "'", function(done) {
                        server.on(ControllerServer.CONNECTED, function() {
                            expect(server.getName()).to.equal(serverName);
                            done();
                        });
                    });
                    //
                    it("The server port should be set to '" + serverPort + "'", function(done) {
                        server.on(ControllerServer.CONNECTED, function() {
                            expect(server.getPort()).to.equal(serverPort);
                            done();
                        });
                    });
                    //
                    it("The server encryption key should be set to '" + serverSalt + "'", function(done) {
                        server.on(ControllerServer.CONNECTED, function() {
                            expect(server.getSalt()).to.equal(serverSalt);
                            done();
                        });
                    });
                    //
                    afterEach(function() {
                        server.disconnect();
                    });
                });
                
                describe("Disconnect", function() {
                    var serverDisconnectResponse;
                    //
                    beforeEach(function(done) {
                        server                      = new ControllerServer();
                        server.connect({name: serverName, port: serverPort, salt: serverSalt});
                        server.on(ControllerServer.CONNECTED, function(){
                            serverDisconnectResponse    = server.disconnect();
                            done();
                        });
                    });
                    //
                    it("The server disconnect returns an instance of it self", function() {
                        expect(serverDisconnectResponse).to.equal(server);
                    });
                    //
                    it("The server name should be set to empty", function() {
                        expect(server.getName()).to.equal('');
                    });
                    //
                    it("The server port should be set to empty", function() {
                        expect(server.getPort()).to.equal(0);
                    });
                    //
                    it("The server salt should be set to empty", function() {
                        expect(server.getSalt()).to.equal('');
                    });
                });
                
                describe("Clients", function() {
                    var clients                 = 3;
                    //
                    beforeEach(function(done) {
                        server              = new ControllerServer();
                        server.connect({name: serverName, port: serverPort, salt: serverSalt});
                        server.on(ControllerServer.CONNECTED, function() {
                            done();
                        });
                    });
                    //
                    it("The clients count should be set to '" + clients + "' after they connected", function(done) {
                        var clientsAdded    = 0;
                        for (var i = 0; i < clients; i ++) new WebSocket("ws://" + clientIP + ":" + serverPort);
                        server.on(ControllerServer.CLIENT_CONNECTED, function() {
                            if (++clientsAdded < clients) return;
                            expect(server.getClientCount()).to.equal(3);
                            done();
                        });
                    });
                    //
                    it("The client ip should be '" + clientIP + "'", function(done) {
                        new WebSocket("ws://" + clientIP + ":" + serverPort);
                        //
                        server.on(ControllerServer.CLIENT_CONNECTED, function(data) {
                            expect(data.client.ip).to.equal("127.0.0.1");
                            done();
                        });
                    });
                    //
                    it("The client token should be 32 chars long", function(done) {
                        new WebSocket("ws://" + clientIP + ":" + serverPort);
                        //
                        server.on(ControllerServer.CLIENT_CONNECTED, function(data) {
                            expect(data.client.token).to.have.length(32);
                            done();
                        });
                    });
                    //
                    it("The client count should be 0 after the only client disconnects", function(done) {
                        var client = new WebSocket("ws://" + clientIP + ":" + serverPort);
                        client.close();
                        //
                        server.on(ControllerServer.CLIENT_DISCONNECTED, function(data) {
                            expect(server.getClientCount()).to.equal(0);
                            done();
                        });
                    });
                    //
                    it("The clients count should be set to 0 after the server is disconnected", function() {
                        server.disconnect();
                        expect(server.getClientCount()).to.equal(0);
                    });
                    //
                    afterEach(function(){
                        server.disconnect();
                    });
                });
                
                describe("Messages", function() {
                    var foobarMessage       = '{"foo": "bar"}';
                    var callbackID          = '42';
                    //
                    beforeEach(function(done) {
                        server              = new ControllerServer();
                        server.connect({name: serverName, port: serverPort, salt: serverSalt});
                        server.on(ControllerServer.CONNECTED, function() {
                            done();
                        });
                    });
                    //
                    it("The client message property 'foo' should be set to 'bar'", function(done) {
                        var client      = new WebSocket("ws://" + clientIP + ":" + serverPort);
                        client.onopen   = function() { client.send(foobarMessage); };
                        server.on(ControllerServer.CLIENT_MESSAGE, function(data) {
                            expect(data.request.foo).to.equal("bar");
                            done();
                        });
                    });
                    //
                    it("The client response callbackID should be set to '" + callbackID + "'", function(done) {
                        var client      = new WebSocket("ws://" + clientIP + ":" + serverPort);
                        client.onopen   = function() { client.send('{"callbackID": "' + callbackID + '"}'); };
                        server.on(ControllerServer.CLIENT_MESSAGE, function(data) {
                            expect(data.response.callbackID).to.equal(callbackID);
                            done();
                        });
                    });
                    //
                    afterEach(function(){
                        server.disconnect();
                    });
                });
                
                describe("Misc", function() {
                    beforeEach(function(done) {
                        server              = new ControllerServer();
                        server.connect({name: serverName, port: serverPort, salt: serverSalt});
                        server.on(ControllerServer.CONNECTED, function() {
                            done();
                        });
                    });
                    //
                    it("The client should be registered by it's token", function(done) {
                        var client      = new WebSocket("ws://" + clientIP + ":" + serverPort);
                        server.on(ControllerServer.CLIENT_CONNECTED, function(data) {
                            expect(server.checkClientByToken(data.client.token)).to.true;
                            done();
                        });
                    });
                    //
                    it("The client should no longer be registered by it's token", function(done) {
                        var client      = new WebSocket("ws://" + clientIP + ":" + serverPort);
                        client.close();
                        server.on(ControllerServer.CLIENT_CONNECTED, function(data) {
                            expect(server.checkClientByToken(data.client.token)).to.false;
                            done();
                        });
                    });
                    //
                    afterEach(function(){
                        server.disconnect();
                    });
                });
            });
        });
    });
});