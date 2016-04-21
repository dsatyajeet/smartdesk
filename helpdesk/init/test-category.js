/**
 * Created by satyajeet on 11/12/15.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/helpdesk');

var CategoryService = require('../service/categoryService');
var async=require('async');
function addCategory(id,name) {
    var context = {errMessage: 'error in adding category..', message: 'Category added successfully'};
    var actionArray = [function addTestCategory(cb) {
        context.cb=cb;
        console.log('in add tkt');
        CategoryService.addCategory(testCallBack,context,id,name);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function findCategory(id) {
    var context = {errMessage: 'error in finding category..', message: 'Category found successfully'};
    var actionArray = [function findTestCategory(cb) {
        context.cb=cb;
        CategoryService.getById(testCallBack,context,id);
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

addCategory(1,'Software');
addCategory(2,'Hardware');

addCategory(3,'Network');
addCategory(4,'Account-Finance');
addCategory(5,'HR-Admin');

//findCategory(3);
