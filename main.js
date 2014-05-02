var serverCfg       = require('./config/confServer.js');
var sessionsModel   = require('./models/modelSessions.js');
var serverCtrl      = require('./controllers/controllerServer.js');
var authCtrl        = require('./controllers/controllerAuth.js');
var charactersCtrl  = require('./controllers/controllerCharacters.js');


serverCtrl.connect(serverCfg,
    // Client Connected:
    function(client)                                                            {
        sessionsModel.save(client.token, null, true);
        console.log(client.upgradeReq.connection.remoteAddress + ' has connected!');
    },
    // Client Message recieved:
    function(client, request)                                                   {
        var response    = {onResult: null, onError: null, error: null, result: null};
        switch(request.type)                                                    {
            case 'auth':        authCtrl.handleRequest(client.token, response, request);        break;
            case 'characters':  charactersCtrl.handleRequest(client.token, response, request);  break;
            default:            response.error = 'Request type unknown'; break;
        }
        return response;
    },
    // Client Disconnected:
    function(client)                                                            {
        if (client.token) sessionsModel.save(client.token, null, false);
    }
);

console.log("Server's running...");