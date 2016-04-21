// Load required packages
var mongoose = require('mongoose');

// Define our token schema
var AccessTokenSchema   = new mongoose.Schema({
    value: { type: String, unique:true,required: true },
    googleToken: { type: String, unique:true},
    userId: { type: String,required: true }
});

// Export the Mongoose model
module.exports = mongoose.model('AccessToken', AccessTokenSchema);