/**
 * Created by satyajeet on 13/12/15.
 */
/**
 * Created by satyajeet on 11/12/15.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/helpdesk2');

var UserService = require('../service/userService');
var async=require('async');

function getUserById(id) {
    var context = {errMessage: 'error in adding user..', message: 'user get successfully'};
    var actionArray = [function getTestUser(cb) {
        context.cb=cb;
        UserService.getById(id,testCallBack,context);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function addUser(username, password, email, firstname, lastname, mobile, roleArray,supportTypeId) {
    var context = {errMessage: 'error in adding user..', message: 'user added successfully'};
    var actionArray = [function addTestUser(cb) {
        context.cb=cb;
        UserService.add2( testCallBack, context,username, password, email, firstname, lastname, mobile, roleArray,supportTypeId);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function updateUser(id, username, email, firstname, lastname, mobile, roleArray,supportTypeId) {
    var context = {errMessage: 'error in adding user..', message: 'user added successfully'};
    var actionArray = [function addTestUser(cb) {
        context.cb=cb;
        UserService.update2( testCallBack, context,id, username, email, firstname, lastname, mobile, roleArray,supportTypeId);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}


function testCallBack(context, err, resObject) {
    console.log('in test callback..');
    if (err) {
        console.error('Error on adding ticket:' + err);
        context.cb(err);
    }
    else {
        console.log(context.message);
        context.resObj = resObject;
        console.log('return object: '+resObject);
        if(context.cb)
        context.cb(null);
        console.log(' cb null');
    }
}

addUser('super@hdesk.in','password','super@hdesk.in','Vijay','Chavan','231323233232',['Admin']);
//addUser('nosupport212@gmail.com','password','nosupport221@gmail.com','tf','tl','2313323233232',[],8);


//updateUser('566c81c3d9e2e492aa6012e1', 'nosupport212@gmail.com', 'nosupport212@gmail.com', 'tfirstname1', 'tlastname', '112123', [],1);
//getUserById('566eb2b8f45de41114a71885');

function mapUser(){
    var context = {errMessage: 'error in mapping user..', message: 'user mapped successfully'};

    UserService.mapUser2(testCallBack,context,'oye@gmail.com','oye@gmail.com','oyefirst','oyelast','oyemobile');
}

//mapUser();