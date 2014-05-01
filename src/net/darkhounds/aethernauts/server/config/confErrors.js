exports.DBError                 = {code:'DBError',                  type:'db',          message:'DataBase error'};
exports.AuthError               = {code:'AuthError',                type:'auth',        message:'Authentication failed'};
exports.AuthLogedin             = {code:'AuthLogedin',              type:'auth',        message:'User Already loged in'};
exports.AuthUsernameReserved    = {code:'AuthUsernameReserved',     type:'auth',        message:'Username is reserved'};
exports.DBNoSession             = {code:'DBNoSession',              type:'session',     message:'Missing Session'};
exports.DBInvalidSession        = {code:'DBInvalidSession',         type:'session',     message:'Invalid Session'};
exports.DBNotLogedin            = {code:'DBNotLogedin',             type:'session',     message:'Not Logedin'};
exports.CharacterNameReserved   = {code:'CharacterNameReserved',    type:'character',   message:'Character name is reserved'};
exports.InvalidCharacter        = {code:'InvalidCharacter',         type:'character',   message:'Invalid Character'};

