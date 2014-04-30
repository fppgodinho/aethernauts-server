
var config  = {
    name:   'aethernauts.darkhounds.net',
    port:   '81',
    salt:   'A3th3rN4ut5'
}

var crypto  = require('crypto');
function hashPassword(password)                                                 {
    return crypto.createHash('md5').update(password).digest('hex');
}

var sessions    = require('./models/sessions.js');
sessions.connect('data/aethernauts/sessions.db');

var users       = require('./models/users.js');
users.connect('data/aethernauts/users.db');

var server  = require('./controllers/server.js').connect(config,
    function(client)                                                            {
        sessions.save(client.token, null, true);
        console.log(client.upgradeReq.connection.remoteAddress + ' has connected!');
    },
    function(client, message)                                                   {
        var response    = {onResult: null, onError: null, error: null, result: null};
        switch(message.type)                                                    {
            case 'login':   login(client.token, message, response); break;
            default:        break;
        }
        return response;
    },
    function(client)                                                            {
        if (client.token) sessions.save(client.token, null, false);
    }
);

function login(token, request, response)                                        {
    users.get({ "credentials.username": request.username }, function (err, user) {
        if (!err && user)                                                       {
            var password    = hashPassword(user.credentials.password + token);
            delete user.credentials.password;
            if (request.password == password) response.result = user;
            else response.error  = 'Authentication failed';
        } else response.error  = 'DataBase error';
        //
        sessions.save(token, user, true);
        if (response.error && response.onError) response.onError(response.error, err);
        else if (response.result && response.onResult) response.onResult(response.result);
    });
}

users.get({ "credentials.username": 'admin' }, function (err, user)             {
    if (!err && !user) users.save('admin', 'admin', hashPassword('teste' + '_' + config.salt), 'Server', 'Admin', [{address: 'admin@darkhounds.net', 'default': true}]);
});

console.log("Server's running...");