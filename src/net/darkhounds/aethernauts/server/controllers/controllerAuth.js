var serverCfg       = require('../config/confServer.js');
var errorsCfg       = require('../config/confErrors.js');
var serverCtrl      = require('./controllerServer.js');

var crypto          = require('crypto');
function hashPassword(password)                                                 {
    return crypto.createHash('md5').update(password).digest('hex');
}

var sessionsModel   = require('../models/modelSessions.js');
var usersModel      = require('../models/modelUsers.js');

exports.handleRequest   = function(token, response, request)                    {
    switch(request.action)                                                      {
        case 'register':    exports.register(token, response, request); break;
        case 'login':       exports.login(token, response, request);    break;
        case 'logout':      exports.logout(token, response);            break;
        default:            break;
    }
};

exports.register        = function(token, response, request)                    {
    usersModel.get({ "credentials.username": request.username }, function (err, user){
        if (err) response.error         = errorsCfg['DBError'];
        else if (user) response.error   = errorsCfg['AuthUsernameReserved'];
        else                                                                    {
            // TODO: Validate fields;
            // type, username, password, firstName, lastName, emails, phones, addresses
            usersModel.save('user', request.username, request.password, request.nameFirst, request.nameLast, [{address: request.email, 'default': true}], null, null,
                function(err, user)                                             {
                    if (err) response.error = errorsCfg['DBError'];
                    else                                                        {
                        sessionsModel.save(token, user, true);
                        delete user.credentials.password;
                        response.result          = user;
                    }
                    //
                    if (response.error && response.onError) response.onError(response.error, err);
                    else if (response.onResult) response.onResult(response.result);
                }
            );
        }
        //
        if (response.error && response.onError) response.onError(response.error, err);
    });
};

exports.login           = function(token, response, request)                    {
    usersModel.get({ "credentials.username": request.username }, function (err, user){
        if (err) response.error         = errorsCfg['DBError'];
        else if (!user) response.error  = errorsCfg['AuthError'];
        else                                                                    {
            var password                = hashPassword(user.credentials.password + token);
            delete user.credentials.password;
            if (request.password != password) response.error  = errorsCfg['AuthError'];
            else                                                                {
                sessionsModel.list({'user.credentials.username': request.username, open: true}, function(err, items) {
                    if (err) response.error             = errorsCfg['DBError'];
                    else if (items && items.length)                             {
                        var i = 0;
                        while (i < items.length)                                {
                            var session = items[i];
                            if (!serverCtrl.checkClientByToken(session.token))  {
                                sessionsModel.save(session.token, null, false);
                                items.splice(i, 1);
                            } else i++;
                        } 
                        if (items.length) response.error    = errorsCfg['AuthLogedin'];
                    } 
                    
                    if (!items || !items.length) response.result          = user;
                    //
                    if (!response.error)                                        {
                        sessionsModel.save(token, user, true);
                        if (response.onResult) response.onResult(response.result);
                    } else if (response.onError) response.onError(response.error, err);
                });
            }
        }
        //
        if (response.error && response.onError) response.onError(response.error, err);
    });
};

exports.logout          = function(token, response)                             {
    sessionsModel.get({token: token}, function(err, session)                    {
        if (err || !session) response.error  = errorsCfg['DBError'];
        else sessionsModel.save(token, null, true);
        
        if (response.error && response.onError) response.onError(response.error, err);
        else if (response.onResult) response.onResult();
    });
};

usersModel.get({ "credentials.username": 'admin' }, function (err, user)        {
    if (!err && !user) usersModel.save('admin', 'admin', hashPassword('teste' + '_' + serverCfg.salt), 'Server', 'Admin', [{address: 'admin@darkhounds.net', 'default': true}]);
});