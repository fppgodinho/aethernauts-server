var crypto          = require('crypto');
var EventEmitter    = require( "events" ).EventEmitter;
var Response        = require(process.src + 'net/darkhounds/core/server/response.js');
var serverCfg       = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var errorsCfg       = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var ModelUsers      = require(process.src + "net/darkhounds/aethernauts/server/models/modelUsers.js");
var ModelSessions   = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');

function hashPassword(password)                                                 {
    return crypto.createHash('md5').update(password).digest('hex');
}

module.exports      = new EventEmitter();

module.exports.hashPassword   = function(password)                              {
    return hashPassword(password + '_' + serverCfg.salt);
};

module.exports.handleRequest  = function(token, request, response)              {
    switch(request.action)                                                      {
//        case 'register':    auth.register(token, request, response);          break;
        case 'login':       module.exports.login(token, request, response);     break;
//        case 'logout':      auth.logout(token, response, response);           break;
        default:            response.emit(Response.ERROR, errorsCfg.UnknownRequestType);    break;
    }
};

//module.exports.register       = function(token, request, response)              {
//    ModelUsers.get({ "credentials.username": request.username }).on(ModelUsers.RESULT,
//        function(event)                                                     {
//            if (event.item) response.emit(Response.ERROR, errorsCfg.AuthUsernameReserved);
//            else {
//                ModelUsers.save({
//                    type:           'user',
//                    credentials:    {username: request.username, password: request.password},
//                    identity:       {
//                        name:           {first: request.firstname, last: request.lastname},
//                        addresses:      [{address: request.email, 'default': true}]
//                    }
//                }).on(ModelUsers.RESULT, function(event)                    {
//                    ModelSessions.save({token: token, user: event.item.user, open: true});
//                    delete event.item.credentials.password;
//                    response.emit(Response.RESOLVED, event.item);
//                }).on(ModelUsers.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
//            }
//        }
//    ).on(ModelUsers.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
//};

module.exports.login          = function(token, request, response)              {
    ModelUsers.instance.findOne({"username": request.username}, function(err, user) {
        if (!err)                                                               {
            if (user)                                                           {
                var password    = hashPassword(user.password + token);
                if (request.password == password)                               {
                    ModelSessions.instance.findOne({user: user, closed: false}, function(err, session) {
                        if (!err)                                               {
                            if (session)                                        {
                                session.updated = Date.now;
                                session.closed  = true;
                                session.save();
                            }
                            ModelSessions.instance.create({
                                ip:         request.ip,
                                token:      token,
                                user:       user
                            }).save(function(err, data)                         {
                                if (!err)                                       {
                                    response.emit(Response.RESOLVED, user);
                                } else response.emit(Response.ERROR, err);  
                            });
                        } else response.emit(Response.ERROR, err);
                    });
                } else response.emit(Response.ERROR, errorsCfg.AuthError);
            } else response.emit(Response.ERROR, errorsCfg.AuthError);
        } else response.emit(Response.ERROR, err);
    });
};



//ModelUsers.get({ "credentials.username": request.username }).on(ModelUsers.RESULT,
//    function(event)                                                     {
//        if (!event.item) response.emit(Response.ERROR, errorsCfg.AuthError);
//        else                                                            {
//            var user        = event.item;
//            var password    = hashPassword(user.credentials.password + token);
//            delete user.credentials.password;
//            if (request.password != password) response.emit(Response.ERROR, errorsCfg.AuthError);
//            else ModelSessions.list({'user.credentials.username': request.username, open: true}).on(ModelUsers.RESULT,
//                function(event)                                         {
//                    if (event.items && event.items.length)              {
//                        var i = 0;
//                        while (i < event.items.length)                  {
//                            var session = event.items[i];
//                            if (!process.server.checkClientByToken(session.token))  {
//                                ModelSessions.save({token: session.token, user: null, open: false});
//                                event.items.splice(i, 1);
//                            } else i++;
//                        }
//                    }
//                    //
//                    if (!event.items || !event.items.length)            {
//                        ModelSessions.save({token: token, user: user, open: true});
//                        response.emit(Response.RESOLVED, user);
//                    } else response.emit(Response.ERROR, errorsCfg.AuthLogedin);
//                }
//            ).on(ModelUsers.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
//        }
//    }
//).on(ModelUsers.ERROR, function(event) { response.emit(Response.ERROR, event.error); });




//module.exports.logout         = function(token, request, response)              {
//    ModelSessions.get({token: token}).on(ModelUsers.RESULT,
//        function(event)                                                     {
//            if (!event.item) response.emit(Response.ERROR, errorsCfg.NotLogedin);
//            else                                                            {
//                response.emit(Response.RESOLVED);
//                ModelSessions.save({token: token, user: null, open: true});
//            }
//        }
//    ).on(ModelUsers.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
//};

