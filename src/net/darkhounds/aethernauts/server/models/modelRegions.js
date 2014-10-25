var util                    = require('util');
var mongoose                = require('mongoose');
var Schema                  = mongoose.Schema;

module.exports              = {};
module.exports.schema       = function()                                        {
    Schema.apply(this, arguments);
    this.add({
        name:       String,
        continent:  { type: Schema.Types.ObjectId, ref: 'Continents' }
    });

    this.statics.create = function(data)                                        {
        var item = new this(data);
        item.initialize();
        return item;
    };
    
    this.methods.initialize   = function()                                      {
        
    }
};
util.inherits(module.exports.schema, Schema);

module.exports.instance                     = mongoose.model("Regions", new module.exports.schema());