/**
 * Created by satyajeet on 11/12/15.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/helpdesk');

var StatusService = require('../service/statusService');
var Status = require('../models/status');
var async=require('async');



function deleteAll() {
Status.remove({},function(err,data){
    if(err)console.log('error on removing..');
    else
    console.log('removed successfully');
});
}
function add(id,name) {
    var context = {errMessage: 'error in adding status..', message: 'status added successfully'};
    var actionArray = [function addTest(cb) {
        context.cb=cb;
        console.log('in add tkt');
        StatusService.add(testCallBack,context,id,name);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function find(id) {
    var context = {errMessage: 'error in finding status..', message: 'Status found successfully'};
    var actionArray = [function findTest(cb) {
        context.cb=cb;
        StatusService.getById(testCallBack,context,id);
    },function show(cb){
        console.log('catagory found: '+context.resObj.name);
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
        context.cb(null);
        console.log(' cb null');
    }
}

add(-1,'Not Initiated')
add(0,'Start')
add(1,'In progress');
add(2,'Complete');
add(3,'Verify');
add(4,'Close');


//deleteAll();


function testasync(){

    var count = 0;

    async.whilst(
        function () { return count < 5; },
        function (callback) {
            count++;
            console.log(count);
            setTimeout(callback, 1000);
        },
        function (err) {
            // 5 seconds have passed
        }
    );
}
//testasync();