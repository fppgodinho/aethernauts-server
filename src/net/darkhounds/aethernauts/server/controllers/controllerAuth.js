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

module.exports                  = new EventEmitter();

module.exports.hashPassword     = function(password)                            {
    return hashPassword(password + '_' + serverCfg.salt);
};

module.exports.handleRequest    = function(token, request, response)            {
    var callback = function (err, data)                                         {
        if (!err) response.emit(Response.RESOLVED, data);
        else response.emit(Response.ERROR, err);
    };
    
    switch(request.action)                                                      {
        case 'register':
            module.exports.register(request.username, request.password, request.firstname, request.lastname, request.email, callback);
            break;
        case 'login':
            module.exports.login(token, request.username, request.password, request.ip, callback);
            break;
        case 'logout':
            module.exports.logout(token, callback);
            break;
        default:            response.emit(Response.ERROR, errorsCfg.UnknownRequestType);    break;
    }
};

module.exports.register         = function(username, password, firstname, lastname, email, callback) {
    ModelUsers.instance.findOne({"username": username}, function(err, user)     {
        if (!err)                                                               {
            if (!user)                                                          {
                user = ModelUsers.instance.create(                              {
                    username:   username,
                    password:   module.exports.hashPassword(password),
                    firstName:  firstname,
                    lastName:   lastname,
                    email:      email
                });
                user.save(function(err)                                         {
                    if (!err && callback)                                       {
                        user.password = null;
                        callback(null, user);
                    } else if (callback) callback(err);
                });
            } else if (callback) callback(errorsCfg.CharacterNameReserved);
        } else if (callback) callback(err);
    });
};

module.exports.login            = function(token, username, password, ip, callback) {
    ModelUsers.instance.findOne({"username": username}, function(err, user)     {
        if (!err)                                                               {
            if (user)                                                           {
                var storedpassword  = hashPassword(user.password + token);
                if (storedpassword == password)                                 {
                    ModelSessions.instance.findOne({user: user, closed: false}, function(err, session) {
                        if (!err)                                               {
                            if (session)                                        {
                                session.updated = Date.now();
                                session.closed  = true;
                                session.save({});
                            }
                            ModelSessions.instance.create({
                                ip:         ip,
                                token:      token,
                                user:       user
                            }).save(function(err)                               {
                                if (!err && callback)                           {
                                    user.password = null;
                                    callback(null, user);
                                } else if (callback) callback(err);  
                            });
                        } else if (callback) callback(err);
                    });
                } else if (callback) callback(errorsCfg.AuthError);
            } else if (callback) callback(errorsCfg.AuthError);
        } else if (callback) callback(err);
    });
};

module.exports.logout           = function(token, callback)                     {
    ModelSessions.instance.findOne({token: token}, function(err, session)       {
        if (!err)                                                               {
            if (session)                                                        {
                session.updated = Date.now();
                session.closed  = true;
                session.save(function(err){
                    if (!err && callback) callback(null);
                    else if (callback) callback(err);
                });
            } else if (callback) callback(errorsCfg.NotLogedin);
        } else if (callback) callback(err);
    });
};

