exports.UnknownProtocol         = {code:'UnknownProtocol',          type:'protocol',    message:'Unknown Protocol'};
exports.UnknownRequestType      = {code:'UnknownRequestType',       type:'protocol',    message:'Unknown Request Type'};

exports.DBError                 = {code:'DBError',                  type:'db',          message:'DataBase error'};

exports.AuthError               = {code:'AuthError',                type:'auth',        message:'Authentication failed'};
exports.AuthLogedin             = {code:'AuthLogedin',              type:'auth',        message:'User Already loged in'};
exports.AuthUsernameReserved    = {code:'AuthUsernameReserved',     type:'auth',        message:'Username is reserved'};

exports.NoSession               = {code:'NoSession',                type:'session',     message:'Missing Session'};
exports.InvalidSession          = {code:'InvalidSession',           type:'session',     message:'Invalid Session'};
exports.NotLogedin              = {code:'NotLogedin',               type:'session',     message:'Not Logedin'};

exports.CharacterNameReserved   = {code:'CharacterNameReserved',    type:'character',   message:'Character name is reserved'};
exports.InvalidCharacter        = {code:'InvalidCharacter',         type:'character',   message:'Invalid Character'};

exports.UserNotAdmin            = {code:'UserNotAdmin',             type:'admin',       message:'User has no admin privileges'};

exports.WorldNotCreated         = {code:'WorldNotCreated',          type:'engine',      message:'World hast been generated yet'};
