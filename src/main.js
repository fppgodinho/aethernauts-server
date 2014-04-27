
var name    = 'Aethernauts.darkhounds.net';
var port    = '81';
var salt    = 'A3th3rN4ut5';
var crypto  = require('crypto');
var clients = [];

function hashPassword(password)                                                 {
    return crypto.createHash('md5').update(password).digest('hex');
}

var db          = require('nedb');
var UsersDB     = new db({ filename: 'data/aethernauts/users.db', autoload: true });
function saveUser(type, username, password, firstName, lastName, emails, phones, addresses)                                         {
    var response                        = { onSuccess: null, onError: null, error:null, user:null};
    //
    UsersDB.findOne({ "credentials.username": username }, function (err, user)  {
        if (!err)                                                               {
            response.user               = updateUser(user, type, username, password, firstName, lastName, emails, phones, addresses);
            UsersDB.update({ "credentials.username": username}, response.user, {upsert: true},
                function (err, affectedUsers, newUser)                          {
                    response.error      = err || null;
                    response.user       = newUser || response.user;
                    if (response.error && response.onError) response.onError(response.error);
                    else if (!response.error && response.onSuccess) response.onSuccess(response.user);
                }
            );
        } else {
            response.error              = err;
            if (response.onError) response.onError(err);
        }
    });
    //
    return response; 
}

function updateUser(user, type, username, password, firstName, lastName, emails, phones, addresses) {
    var now         = new Date();
    var user        = user || { created: now };
    user.type       = type;
    user.modified   = now;
    user.credentials = {
        username:       username,
        password:       password
    };
    user.identity    = {
        name:           { first:  firstName, last:   lastName },
        emails:         emails || [],
        phones:         phones || [],
        addresses:      addresses || []
    };
    return user;
}

var SessionsDB  = new db({ filename: 'data/aethernauts/sessions.db', autoload: true });
function saveSession(token, user, open)                                         {
    var response    = { onSuccess: null, onError: null, error:null, session:null};
    //
    SessionsDB.findOne({ token: token, open: true }, function (err, session)    {
        if (!err)                                                               {
            var now                     = new Date();
            response.session            = updateSession(session, token, user, open);
            if (session) response.session.log.push({message:open?'update':'close', date:now, user:user});
            //
            SessionsDB.update({ token: token, open: true }, response.session, {upsert: true},
                function (err, affectedSessions, newSession)                    {
                    response.error      = err || null;
                    response.session    = newSession || response.session;
                    if (response.error && response.onError) response.onError(response.error);
                    else if (!response.error && response.onSuccess) response.onSuccess(response.session);
                }
            );
        } else {
            response.error      = err;
            if (response.onError) response.onError(err);
        }
    });
    //
    return response; 
}

function updateSession(session, token, user, open)                              {
    var now         = new Date();
    var session     = session || { token:token, created: now, log: [{message: 'opened', date:now}], open: true };
    session.user    = user;
    session.open    = open;
    return session;
}

var ws      = require('ws').Server;
var server  = new ws({port: port});
server.on('connection', function(client)                                        {
    client.on('message', function(message)                                      {
        message             = JSON.parse(message);
        var reponse         = handleClientMessage(client, message);
        reponse.callbackID  = message.callbackID;
        reponse.type        = 'response';
        if (reponse.error || reponse.result) client.send(JSON.stringify(reponse));
        else reponse.onResult = reponse.onError = function ()                   {
            if (client.readyState == client.OPEN) client.send(JSON.stringify(reponse));
        };
    });
    
    client.on('close', function()                                               {
        if (client.token) saveSession(client.token, null, false);
        clients.splice(clients.indexOf(client), 1);
    });
    
    client.ip       = client.upgradeReq.connection.remoteAddress;
    client.token    = crypto.createHash('md5').update(client.ip + Math.random()).digest('hex').toUpperCase();
    clients.push(client);
    saveSession(client.token, null, true);
    client.send(JSON.stringify({type:'session', state:'start', name: name, token: client.token, salt: salt}));
    console.log(client.upgradeReq.connection.remoteAddress + ' has connected!');
});


function handleClientMessage(client, message)                                   {
    var response    = {onResult: null, onError: null, error: null, result: null};
    switch(message.type)                                                        {
        case 'login':   login(client.token, message, response); break;
        default:        break;
    }
    
    return response;
}

function login(token, request, response)                                        {
    UsersDB.findOne({ "credentials.username": request.username }, function (err, user) {
        if (!err && user)                                                       {
            var password    = hashPassword(user.credentials.password + token);
            delete user.credentials.password;
            if (request.password == password) response.result = user;
            else response.error  = 'Authentication failed';
        } else response.error  = 'DataBase error';
        //
        saveSession(token, user, true);
        if (response.error && response.onError) response.onError(response.error, err);
        else if (response.result && response.onResult) response.onResult(response.result);
    });
}

UsersDB.findOne({ "credentials.username": 'admin' }, function (err, user)       {
    if (!err && !user) saveUser('admin', 'admin', hashPassword('teste' + '_' + salt), 'Server', 'Admin', [{address: 'admin@darkhounds.net', 'default': true}]);
});

console.log("Server's running...");