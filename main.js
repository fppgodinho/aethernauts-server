var path                = require('path');
process.src             = __dirname + '/src/';
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var Application         = require(process.src + 'net/darkhounds/aethernauts/server/application.js');
//
var application         = new Application();
application.on(Application.DB_CONNECTED, function()                             {
    console.log("Connected to the DataBase...");
});
application.on(Application.SERVER_CONNECTED, function()                         {
    console.log("Server's running...");
});
application.on(Application.CLIENT_CONNECTED, function(data)                     {
    console.log("Client Connected: " + data.client.ip);
});
application.on(Application.CLIENT_MESSAGED, function(data)                      {
    console.log("Client Messaged: " + data.client.ip);
});
application.on(Application.CLIENT_DISCONNECTED, function(data)                  {
    console.log("Client Disconnected: " + data.client.ip);
});
application.on(Application.APPLICATION_ERROR, function(data)                    {
    console.log(data);
});
application.create(serverCfg);

