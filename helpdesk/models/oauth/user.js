// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// Define our user schema
var UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },mobile: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    supportType: {
        type: ObjectId,
        ref:'Category'
    },
    roles:[{type:ObjectId,ref:'Role'}]
});


// Execute before each user.save() call
/*UserSchema.pre('save', function(callback) {
    var user = this;

    // Break out if the password hasn't changed
    if (!user.isModified('password')) return callback();

    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
        if (err) return callback(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return callback(err);
            user.password = hash;
            callback();
        });
    });
});*/

UserSchema.methods.verifyPassword = function(password, cb) {
    cb(null,(password==this.password));

/*    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });*/
};

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);

