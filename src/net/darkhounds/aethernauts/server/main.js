var serverCfg       = require('./config/confServer.js');
var sessionsModel   = require('./models/modelSessions.js');
var serverCtrl      = require('./controllers/controllerServer.js');
var authCtrl        = require('./controllers/controllerAuth.js');


serverCtrl.connect(serverCfg,
    // Client Connected:
    function(client)                                                            {
        sessionsModel.save(client.token, null, true);
        console.log(client.upgradeReq.connection.remoteAddress + ' has connected!');
    },
    // Client Message recieved:
    function(client, message)                                                   {
        var response    = {onResult: null, onError: null, error: null, result: null};
        switch(message.type)                                                    {
            case 'register':    authCtrl.register(client.token, response, message); break;
            case 'login':       authCtrl.login(client.token, response, message);    break;
            case 'logout':      authCtrl.logout(client.token, response);            break;
            default:        break;
        }
        return response;
    },
    // Client Disconnected:
    function(client)                                                            {
        if (client.token) sessionsModel.save(client.token, null, false);
    }
);

console.log("Server's running...");