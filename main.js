var path                = require('path');
process.src             = __dirname + '/src/';

var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var ControllerServer    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerServer.js');
// var ModelSessions       = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');
// var Auth                = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAuth.js');
// var Characters          = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerCharacters.js');

var serverCtrl          = new ControllerServer();
// var charactersCtrl      = new Characters();
// var authCtrl            = new Auth();

serverCtrl.on(ControllerServer.CONNECTED, function()                            {
    console.log("Server's running...");
});
serverCtrl.on(ControllerServer.CLIENT_CONNECTED, function(event)                {
    // ModelSessions.save({token: event.client.token, user: null, open: true});
    console.log(event.client.ip + ' has connected!');
});
serverCtrl.on(ControllerServer.CLIENT_MESSAGE, function(event)                  {
//    if (event.request) switch(event.request.type)                               {
//        case 'auth':        authCtrl.handleRequest(event.client.token, event.request, event.response);          break;
//        case 'characters':  charactersCtrl.handleRequest(event.client.token, event.request, event.response);    break;
//        default:            event.response.setError(errorsCfg.UnknownRequestType);                              break;
//    } else event.response.setError(errorsCfg.UnknownProtocol);
});
serverCtrl.on(ControllerServer.CLIENT_DISCONNECTED, function(event)             {
//    if (event.client.token) ModelSessions.save(event.client.token, null, false);
//    console.log(event.client.ip + ' has disconnected!');
});
serverCtrl.connect(serverCfg);
//
process.server  = serverCtrl;
