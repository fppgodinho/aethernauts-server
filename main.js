var path                = require('path');
process.src             = __dirname + '/src/';
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var Application         = require(process.src + 'net/darkhounds/aethernauts/server/application.js');
//
Application.on(Application.CREATED, function()                                  {
    console.log("Application created...");
});
Application.on(Application.DESTROYED, function()                                {
    console.log("Application destroyed!");
});
Application.on(Application.DB_CONNECTED, function()                             {
    console.log("Connected to the DataBase...");
});
Application.on(Application.DB_CONNECTED, function()                             {
    console.log("Connected to the DataBase...");
});
Application.on(Application.DB_DISCONNECTED, function()                          {
    console.log("Disconnected to the DataBase!");
});
Application.on(Application.SERVER_CONNECTED, function()                         {
    console.log("Server's running...");
});
Application.on(Application.SERVER_DISCONNECTED, function()                      {
    console.log("Server's stoped!");
});
Application.on(Application.CLIENT_CONNECTED, function(data)                     {
    console.log("Client Connected: " + data.client.ip);
});
Application.on(Application.CLIENT_MESSAGED, function(data)                      {
    console.log("Client Messaged: " + data.client.ip);
});
Application.on(Application.CLIENT_DISCONNECTED, function(data)                  {
    console.log("Client Disconnected: " + data.client.ip);
});
Application.on(Application.APPLICATION_ERROR, function(data)                    {
    console.log(data);
});
Application.create(serverCfg);

