var mongoose = require('mongoose');

module.exports = mongoose.model('TicketXXX', {
	userid : {type : String, required:true, unique: true},
	subject : {type : String, default: ''},
	content : {type : String, default: ''},
	status : {type : String, default: 'NEW'},
	createDate : {type : Date},
	updateDate : {type : Date}
});