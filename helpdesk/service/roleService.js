/**
 * Created by satyajeet on 13/12/15.
 */
var mongoose=require('mongoose');
var Role=require('../models/oauth/role');

exports.getRoles=function(callback,context,roleArray) {
    Role.find()
        .where('name')
        .in(roleArray)
        .exec(function (err, roles) {
            if (err) {
                console.error('error in finding roles.');
                return callback(context, err);
            }
            else {
                console.log(' record found ' + roles);
                console.log('total records: ' + roles.length);
                return callback(context, null,roles);
            }
        });

}