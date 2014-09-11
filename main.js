var path                = require('path');
process.src             = __dirname + '/src/';

var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var ControllerServer    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerServer.js');
var ControllerAuth      = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAuth.js');



var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');
ControllerDB.on('error', console.error.bind(console, 'connection error:'));
ControllerDB.once('open', function callback ()                                  {
    var serverCtrl          = new ControllerServer();
    serverCtrl.on(ControllerServer.CONNECTED, function()                            {
        console.log("Server's running...");
    });
    serverCtrl.on(ControllerServer.CLIENT_CONNECTED, function(event)                {
        console.log(event.client.ip + ' has connected!');
    });
    serverCtrl.on(ControllerServer.CLIENT_MESSAGE, function(event)           {
    if (event.request) switch(event.request.type)                               {
        case 'auth':        ControllerAuth.handleRequest(event.client.token, event.request, event.response);    break;
//        case 'characters':  charactersCtrl.handleRequest(event.client.token, event.request, event.response);    break;
        default:            event.response.setError(errorsCfg.UnknownRequestType);                              break;
    } else event.response.setError(errorsCfg.UnknownProtocol);
    });
    serverCtrl.on(ControllerServer.CLIENT_DISCONNECTED, function(event)             {
//    if (event.client.token) ModelSessions.save(event.client.token, null, false);
//    console.log(event.client.ip + ' has disconnected!');
    });
    serverCtrl.connect(serverCfg);
    //
    process.server  = serverCtrl;
});
