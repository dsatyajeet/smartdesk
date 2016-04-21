var async = require('async');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/helpdesk');

var Client = require('../models/oauth/client');
var User = require('../models/oauth/user');
var Role = require('../models/oauth/role');

function asyncMe() {
    var a1='Satya';
    actionArray = [
        function one(cb) {
            populateRole('Mulayam',cb);
            //console.log(a1);
            //cb(null);
            /*someAsyncFunction(params, function(err, results) {
             if (err) {
             cb(new Error('There was an error'));
             }
             console.log('one');
             cb(null);
             });*/
        },
        function two(cb) {
            //console.log('two');
            populateRole('Sonia',cb);
            //cb(null);
        },
        function three(cb,a1){
            console.log('three'+cb);
        }
    ]


    async.series(actionArray);
}

function three(cb,a1){
    console.log('three');
}
//asyncMe();

function f1(){
    var j=0;
    console.log('in f1.');
    for(var i=0;i<900000000;i++){
        j++;
    }
    console.log('f1 end: '+j)
}
function f2(){
    var j=0;
    console.log('in f2.');
    for(var i=0;i<9000000;i++){
        j++;
    }
    console.log('f2 end: '+j)
}
//f1();
console.log('interval')
//f2();

function async1(your_function, callback) {
    setTimeout(function() {
        your_function();
        if (callback) {callback();}
    }, 10);
}


function populateRole(uname,callback){
    console.log(uname);
    User.findOne({username:uname}).populate('roles').exec(function(err, _roles){
        if(err){
            console.log('error in populate');callback(err);
        }
        else{
            console.log('Role populated: for user :'+uname+'   >> '+_roles.roles[1]);
            callback(null);
            console.log('test after callback #####'+uname)
        }
    });
}
//async1(f1,function(){console.log('callbck..');})

//populateRole('Mulayam');
console.log('next to populate..');
//populateRole('Sonia')

asyncMe();