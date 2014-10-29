var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Sessions";
    var _schema     = new Mongoose.Schema({
        ip:         String,
        token:      String,
        created:    { type: Date, default: Date.now },
        updated:    { type: Date, default: Date.now },
        closed:     { type: Boolean, default: false },
        user:       { type: Mongoose.Schema.Types.ObjectId, ref: 'Users' }
    });

    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
