/*var TicketSchema = new mongoose.Schema( {
 users : [{type : ObjectId,  ref:'User'}],
 subject : {type : String, default: ''},
 content : {type : String, default: ''},
 status : {type : String, default: 'NEW'},
 createDate : {type : Date},
 updateDate : {type : Date}
 });*/

// Load required packages
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var TicketSchema = new mongoose.Schema({
    user: {type: ObjectId, ref: 'User',required:true},
    assignedTo: {type: ObjectId, ref: 'User'},
    type: {type: ObjectId, ref: 'Category',required:true},
    status: {type: ObjectId, ref: 'Status',required:true},
    subject: {type: String},
    content: {type: String, default: ''},
    createDate: {type: Date,default:Date.now},
    updateDate: {type: Date,default:Date.now}
});

module.exports = mongoose.model('Ticket', TicketSchema);