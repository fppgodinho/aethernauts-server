var mongoose = require('mongoose');

// *****************************************************************************
// { region: USER
function _createUsers()                                                         {
    mongoose.model('User', mongoose.Schema({
        username:   String,
        password:   String,
        firstName:  String,
        lastName:   String,
        email:      String
    })).collection.drop();
    var User    = mongoose.model('User');
    //
    var admin   = new User({
        username:   "admin",
        password:   "",
        firstName:  "Server",
        lastName:   "Admin",
        email:      "cainvampyr@gmail.com"
    }).save();
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: World
function _createWorld()                                                         {
    mongoose.model('World', mongoose.Schema({
        name:   String
    })).collection.drop();
    var World   = mongoose.model('World');
    //
    var world   = new World({
        name:   "world"
    }).save();
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: Connection
mongoose.connect('mongodb://localhost:27017/aethernauts');
var db  = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback ()                                            {
    _createUsers();
    _createWorld();
});
// } endregion
// *****************************************************************************





