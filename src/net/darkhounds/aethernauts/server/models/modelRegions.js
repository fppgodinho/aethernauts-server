var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Continents";
    var _schema     = new Mongoose.Schema({
        name:   String,
        continent:  { type: Mongoose.Schema.Types.ObjectId, ref: 'Continents' }
    });

    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
