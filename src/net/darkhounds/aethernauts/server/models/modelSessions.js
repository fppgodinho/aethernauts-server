var util                    = require('util');
var mongoose                = require('mongoose');
var Schema                  = mongoose.Schema;

module.exports              = {};
module.exports.schema       = function()                                        {
    Schema.apply(this, arguments);
    this.add({
        ip:         String,
        token:      String,
        created:    { type: Date, default: Date.now },
        updated:    { type: Date, default: Date.now },
        closed:     { type: Boolean, default: false },
        user:       { type: Schema.Types.ObjectId, ref: 'Users' } 
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

module.exports.instance                     = mongoose.model("Sessions", new module.exports.schema());
